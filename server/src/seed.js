require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');
const { hashPassword } = require('./utils/auth');

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Task.deleteMany({});
  const passwordHash = await hashPassword('Passw0rd!');
  const user = await User.create({
    email: 'demo@example.com',
    username: 'demo',
    passwordHash
  });
  await Task.create({ userId: user._id, title: 'Sample Task', priority: 'medium' });
  console.log('Seeded');
  process.exit(0);
}

seed();
