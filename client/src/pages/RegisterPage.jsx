import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Investigator" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await register(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create account.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <Card className="p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Onboarding</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Create a forensics account</h2>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <Input placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="Investigator">Investigator</option>
              <option value="Analyst">Analyst</option>
              <option value="Admin">Admin</option>
            </select>
            {error ? <p className="md:col-span-2 text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="md:col-span-2 py-3">
              Create account
            </Button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            Already have access?{" "}
            <Link to="/login" className="font-medium text-slate-900">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
