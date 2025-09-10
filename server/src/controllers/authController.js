const { z } = require('zod');
const User = require('../models/User');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} = require('../utils/auth');

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6)
});

async function signup(req, res) {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues });
  }
  const { email, username, password } = parse.data;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return res.status(400).json({ success: false, error: 'User exists' });
  }
  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, username, passwordHash });
  return res.status(201).json({ success: true, data: { id: user._id } });
}

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string()
});

async function login(req, res) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues });
  }
  const { emailOrUsername, password } = parse.data;
  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const match = await comparePassword(password, user.passwordHash);
  if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshTokens.push(refreshToken);
  await user.save();
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  });
  return res.json({ success: true, data: { accessToken } });
}

async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) throw new Error('Invalid');
    const newAccess = generateAccessToken({ id: user._id });
    const newRefresh = generateRefreshToken({ id: user._id });
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefresh);
    await user.save();
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false
    });
    return res.json({ success: true, data: { accessToken: newAccess } });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
      await User.updateOne({ _id: payload.id }, { $pull: { refreshTokens: token } });
    } catch (err) {}
  }
  res.clearCookie('refreshToken');
  return res.json({ success: true });
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select('email username roles');
  return res.json({ success: true, data: user });
}

module.exports = { signup, login, refresh, logout, me };
