import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";
import { API_URL, parseApiResponse } from "../lib/api";

interface Props {
  onAuth: (user: User) => void;
}

export default function RegisterPage({ onAuth }: Props) {
  const [name, setName] = useState("");
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
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await parseApiResponse<{ token: string; user: User; error?: string; detail?: string }>(res);
      if (!res.ok) throw new Error(data.error || data.detail || "Registration failed");

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
      {/* Left Column - Aesthetic Visual */}
      <div className="hidden lg:block relative bg-[#F8F9FF] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full bg-dark-navy rounded-[3rem] shadow-2xl flex flex-col p-12 relative overflow-hidden text-white"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
               <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full" />
               <div className="absolute bottom-20 right-20 w-40 h-40 border-4 border-neon-purple rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <span className="text-neon-purple font-bold uppercase tracking-widest text-sm mb-4">Join Routineo</span>
              <h2 className="text-5xl font-display font-bold mb-6 leading-tight">
                Focus on what matters most.
              </h2>
              <div className="space-y-6 mt-8 text-slate-300">
                 <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                       <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    <p className="font-medium">Track daily habits & streaks</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-neon-purple/20 rounded-full flex items-center justify-center">
                       <div className="w-2 h-2 bg-neon-purple rounded-full" />
                    </div>
                    <p className="font-medium">Pomodoro study timer</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-coral/20 rounded-full flex items-center justify-center">
                       <div className="w-2 h-2 bg-coral rounded-full" />
                    </div>
                    <p className="font-medium">Detailed productivity analytics</p>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
              <Flame className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-dark-navy">Routineo</span>
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Create an account</h1>
            <p className="text-slate-500">Start your productivity journey today.</p>
          </header>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-neon-purple focus:ring-4 focus:ring-neon-purple/5 outline-none transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-neon-purple font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
