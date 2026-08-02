import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, UserCheck, KeyRound, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuickLogin = async (uname, pass, autoSubmit = false) => {
    const credentials = { username: uname, password: pass };
    setFormData(credentials);
    setError("");

    if (autoSubmit) {
      setLoading(true);
      try {
        await login(credentials);
        navigate("/admin");
      } catch (err) {
        console.error("Quick Login Error:", err);
        setError("Failed to auto-login. Invalid credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      navigate("/admin");
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid username or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glow Overlay */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl z-10">
        
        {/* Left Side Hero Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 text-white">
                <GraduationCap size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">USMS</h1>
                <p className="text-xs text-blue-300 font-medium">Unified Student Management System</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Empowering Next-Gen University Operations
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Centralized university platform for real-time attendance tracking, examination marksheets, online fee ledgers, and academic schedules.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
                <span>Role-based access for Admin, Faculty & Students</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
                <span>Instant semester fee collection & PDF receipts</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
                <span>Automated CGPA grade calculations & marksheets</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 pt-6 border-t border-slate-800 relative z-20">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Click Demo Account to Auto-Fill & Login:
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin", "admin123", true)}
                className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={15} /> Admin
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("dr_alan_turing", "faculty123", true)}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                👨‍🏫 Faculty
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("prajwal_sharma", "student123", true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                👨‍🎓 Student
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-slate-900 relative z-10">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Account Sign In</h3>
              <p className="text-sm text-slate-400 mt-1">Please enter your credentials to access your university portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    name="username"
                    required
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm rounded-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-11 text-sm rounded-lg shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-800/80">
              <p className="text-xs text-slate-500">
                Unified Student Management System (USMS) &bull; Secure Encrypted JWT Session
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;