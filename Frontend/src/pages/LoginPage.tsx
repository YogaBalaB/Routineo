import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";
import { API_URL } from "../lib/api";

interface Props {
  onAuth: (user: User) => void;
}

export default function LoginPage({ onAuth }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      onAuth(data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
              <Flame className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-dark-navy">Routineo</span>
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Welcome back!</h1>
            <p className="text-slate-500">Log in to your account and keep flowin'.</p>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/5 outline-none transition-all"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/5 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-purple text-white py-3 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("demo@Routineo.com");
                setPassword("password123");
              }}
              className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-lg hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Demo Login
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-neon-purple font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Aesthetic Visual */}
      <div className="hidden lg:block relative bg-[#F8F9FF] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-full bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col p-12 relative overflow-hidden"
          >
            {/* Abstract Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/40 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-soft-blue/40 rounded-full blur-3xl -ml-20 -mb-20" />

            <div className="relative z-10 flex flex-col h-full">
              <span className="text-neon-purple font-bold uppercase tracking-widest text-sm mb-4">Productivity Tip</span>
              <h2 className="text-4xl font-display font-bold text-dark-navy mb-6 leading-tight">
                "The secret of getting ahead is getting started."
              </h2>
              <div className="mt-auto flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Flame className="text-neon-purple" />
                 </div>
                 <div>
                    <p className="font-bold text-dark-navy">Routineo AI</p>
                    <p className="text-slate-500 text-sm">Your study companion</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
