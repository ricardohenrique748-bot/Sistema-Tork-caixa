import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Eye, EyeOff, Lock, User, AlertCircle, ArrowRight,
  Truck, BarChart3, Shield, MapPin, Bell, Wrench
} from 'lucide-react';


interface LoginProps {
  onLogin: () => void;
}

const CREDENTIALS = { user: 'tork', pass: '123456' };

const floatingIcons = [
  { Icon: BarChart3, x: -140, y: -90,  delay: 0    },
  { Icon: Shield,    x:  130, y: -110, delay: 0.6  },
  { Icon: MapPin,    x: -150, y:  70,  delay: 1.2  },
  { Icon: Bell,      x:  140, y:  90,  delay: 0.9  },
  { Icon: Wrench,    x:  -60, y:  145, delay: 1.6  },
  { Icon: Truck,     x:   50, y:  140, delay: 0.3  },
];

export default function Login({ onLogin }: LoginProps) {
  const [user, setUser]         = useState('');
  const [pass, setPass]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (user.trim() === CREDENTIALS.user && pass === CREDENTIALS.pass) {
        if (remember) localStorage.setItem('tork_auth', '1');
        onLogin();
      } else {
        setError('Usuário ou senha incorretos.');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">

      {/* ══════════════════════════════════
          PAINEL ESQUERDO — branding animado
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[48%] bg-[#111111] flex-col items-center justify-center relative overflow-hidden">

        {/* Glow radial laranja */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 52%, rgba(245,160,0,0.22) 0%, transparent 70%)'
        }} />

        {/* Nome da marca no topo */}
        <div className="absolute top-10 left-10">
          <p className="font-display text-lg font-bold text-white tracking-tight">Tork <span className="text-[#F5A000]">Locações</span></p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">Gestão de Frotas</p>
        </div>

        {/* ── Orb central ── */}
        <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>

          {/* Ring externo — gira devagar */}
          <motion.div
            className="absolute rounded-full border border-[#F5A000]/20"
            style={{ width: 320, height: 320 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#F5A000]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F5A000]/60" />
          </motion.div>

          {/* Ring médio — gira ao contrário */}
          <motion.div
            className="absolute rounded-full border border-[#F5A000]/35"
            style={{ width: 230, height: 230 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F5A000]/80" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-[#F5A000]/50" />
          </motion.div>

          {/* Orb — pulsa com glow laranja */}
          <motion.div
            className="relative w-32 h-32 rounded-full flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(245,160,0,0.18) 0%, rgba(245,160,0,0.05) 100%)' }}
            animate={{ boxShadow: [
              '0 0 24px 4px rgba(245,160,0,0.15), 0 0 60px 10px rgba(245,160,0,0.08)',
              '0 0 48px 12px rgba(245,160,0,0.40), 0 0 100px 24px rgba(245,160,0,0.18)',
              '0 0 24px 4px rgba(245,160,0,0.15), 0 0 60px 10px rgba(245,160,0,0.08)',
            ]}}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Truck className="h-10 w-10 text-[#F5A000]" strokeWidth={1.5} />
          </motion.div>

          {/* Ícones flutuantes — só ícone, sem caixa */}
          {floatingIcons.map(({ Icon, x, y, delay }, i) => (
            <motion.div
              key={i}
              className="absolute flex items-center justify-center"
              style={{ left: `calc(50% + ${x}px - 12px)`, top: `calc(50% + ${y}px - 12px)` }}
              animate={{ y: [0, -8, 0], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3 + i * 0.3, delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="h-5 w-5 text-[#F5A000]" strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>

        {/* Texto */}
        <motion.div
          className="text-center mt-2 px-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-bold text-white leading-snug">
            Controle total<br />da sua frota.
          </h2>
          <p className="text-white/40 text-sm mt-2">Gestão integrada de logística e caixa</p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-5 px-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {['Frota', 'Caixa', 'Alertas', 'Relatórios'].map(f => (
            <span key={f} className="bg-white/5 text-white/50 text-[11px] px-3 py-1 rounded-full border border-white/10">
              {f}
            </span>
          ))}
        </motion.div>

        {/* Rodapé */}
        <p className="absolute bottom-6 text-white/20 text-[10px]">
          © {new Date().getFullYear()} Tork Locações
        </p>
      </div>

      {/* ══════════════════════════════════
          PAINEL DIREITO — formulário
      ══════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A]">Fazer Login</h1>
            <p className="text-[#9A8060] text-sm mt-1.5">Acesse o painel de gestão da frota</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Usuário */}
            <div>
              <label className="block text-[10px] font-bold text-[#5A4828] uppercase tracking-widest mb-2">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A8060]" />
                <input
                  type="text"
                  value={user}
                  onChange={e => { setUser(e.target.value); setError(''); }}
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  className="w-full bg-white border border-[#FDDCAA] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1A1A1A] placeholder-[#9A8060] focus:outline-none focus:ring-2 focus:ring-[#F5A000]/40 focus:border-[#F5A000] transition"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[10px] font-bold text-[#5A4828] uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A8060]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(''); }}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="w-full bg-white border border-[#FDDCAA] rounded-xl pl-10 pr-11 py-3 text-sm text-[#1A1A1A] placeholder-[#9A8060] focus:outline-none focus:ring-2 focus:ring-[#F5A000]/40 focus:border-[#F5A000] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A8060] hover:text-[#1A1A1A] transition"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Lembrar-me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-[#FDDCAA] accent-[#F5A000] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-[#9A8060] cursor-pointer select-none">
                Lembrar login
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333333] active:scale-[.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all text-sm tracking-wide shadow-sm mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

          {/* Rodapé */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[10px] text-center text-[#9A8060]">Acesso restrito · Sistema interno TORK LOG</p>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
