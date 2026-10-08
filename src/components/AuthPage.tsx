import { useState } from 'react';
import { useAuth, type UserRole } from '@/context/AuthContext';
import { Waves, Mail, Lock, User as UserIcon, Shield, Satellite, HardHat, Eye, EyeOff, AlertCircle } from 'lucide-react';

const roles: { id: UserRole; label: string; icon: typeof Shield; description: string }[] = [
  { id: 'Environmental Inspector', label: 'Environmental Inspector', icon: Shield, description: 'Monitor incidents, review AI analysis, and manage response workflows' },
  { id: 'Satellite Analyst', label: 'Satellite Analyst', icon: Satellite, description: 'Operate satellite feeds, trigger captures, and validate AI detection results' },
  { id: 'Field Response Team', label: 'Field Response Team', icon: HardHat, description: 'Execute cleanup operations and update incident status from the field' },
];

export function AuthPage() {
  const { signIn, signUp, error, clearError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('Environmental Inspector');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, role, displayName);
      }
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ocean-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 items-center justify-center mb-4">
            <Waves className="w-8 h-8 text-sky-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 pulse-dot" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">OceanEye</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Satellite Pollution Detection</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <button
              onClick={() => { setMode('signin'); clearError(); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); clearError(); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="inspector@oceaneye.gov"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Select Your Role</label>
                <div className="space-y-2">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                          role === r.id
                            ? 'bg-sky-500/15 border-sky-500/30'
                            : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${role === r.id ? 'text-sky-400' : 'text-slate-500'}`} />
                        <div>
                          <p className={`text-sm font-medium ${role === r.id ? 'text-sky-400' : 'text-slate-200'}`}>{r.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signin' && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">Demo Accounts:</p>
              <p>inspector@oceaneye.com / password123 — Environmental Inspector</p>
              <p>analyst@oceaneye.com / password123 — Satellite Analyst</p>
              <p>field@oceaneye.com / password123 — Field Response Team</p>
            </div>
          )}

          <p className="text-center text-xs text-slate-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); clearError(); }}
              className="text-sky-400 hover:text-sky-300 font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4">
          AI-Powered Autonomous Satellite Platform for Real-Time Coastal Marine Pollution Detection
        </p>
      </div>
    </div>
  );
}
