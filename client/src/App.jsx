import { useState, useEffect } from 'react';

function App() {
  const [token, setToken] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });

  const login = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.success) setToken(data.data.accessToken);
  };

  useEffect(() => {
    if (token) {
      fetch('http://localhost:4000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setTasks(d.data);
        });
    }
  }, [token]);

  if (!token) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <h1 className="text-2xl mb-4">Login</h1>
        <form onSubmit={login} className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Email or Username"
            value={form.emailOrUsername}
            onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="bg-blue-500 text-white px-4 py-2" type="submit">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Tasks</h1>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t._id} className="border p-2 rounded">
            {t.title} - {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
