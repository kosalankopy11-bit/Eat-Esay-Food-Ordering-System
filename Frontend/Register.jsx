import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to register");
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Create account</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <input className="form-input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input className="form-input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="form-input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn-primary w-full" type="submit">Register</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link className="font-semibold text-tomato" to="/login">Login</Link>
      </p>
    </section>
  );
}
