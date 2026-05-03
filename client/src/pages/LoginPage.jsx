import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await login(form);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px]">
        <div className="hidden rounded-[2rem] bg-slate-900 p-10 text-white shadow-2xl lg:block">
          <p className="text-xs uppercase tracking-[0.32em] text-sky-300">Digital Forensics Platform</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Investigate evidence, trace custody, and verify integrity with one operational console.</h1>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <p>Case orchestration for investigators, analysts, and supervisors.</p>
            <p>AI-assisted review, blockchain verification, and audit-grade evidence traceability.</p>
          </div>
        </div>
        <Card className="p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Secure Access</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Sign in to Investigator Workspace</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" className="w-full py-3">
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            New investigator?{" "}
            <Link to="/register" className="font-medium text-slate-900">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
