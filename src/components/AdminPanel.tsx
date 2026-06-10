import { Power, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  systemDisabled: boolean;
  onToggleSystem: () => void;
}

export default function AdminPanel({ systemDisabled, onToggleSystem }: AdminPanelProps) {
  const handleToggle = () => {
    const msg = systemDisabled
      ? 'Reativar o sistema para todos os usuários?'
      : 'Desativar o sistema temporariamente? Outros usuários verão uma tela de manutenção.';
    if (window.confirm(msg)) onToggleSystem();
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pt-4">

      <div>
        <h2 className="font-display text-lg font-bold text-[#1A1A1A]">Painel Administrativo</h2>
        <p className="text-xs text-[#9A8060] mt-0.5">Acesso restrito — visível apenas para o administrador master</p>
      </div>

      {/* Status atual */}
      <div className={`rounded-2xl border p-6 flex items-center gap-5 ${
        systemDisabled
          ? 'bg-rose-50 border-rose-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          systemDisabled ? 'bg-rose-100' : 'bg-emerald-100'
        }`}>
          {systemDisabled
            ? <AlertTriangle className="h-6 w-6 text-rose-600" />
            : <ShieldCheck className="h-6 w-6 text-emerald-600" />
          }
        </div>
        <div>
          <p className="font-bold text-sm text-[#1A1A1A]">
            Sistema {systemDisabled ? 'DESATIVADO' : 'ATIVO'}
          </p>
          <p className={`text-xs mt-0.5 ${systemDisabled ? 'text-rose-600' : 'text-emerald-600'}`}>
            {systemDisabled
              ? 'Outros usuários estão vendo a tela de manutenção.'
              : 'Todos os usuários têm acesso normal ao sistema.'}
          </p>
        </div>
      </div>

      {/* Botão de toggle */}
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${
          systemDisabled
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-rose-600 hover:bg-rose-700 text-white'
        }`}
      >
        <Power className="h-5 w-5" />
        {systemDisabled ? 'Reativar Sistema' : 'Desativar Sistema Temporariamente'}
      </button>

      <p className="text-center text-[10px] text-[#9A8060]">
        A desativação exibe uma tela de manutenção para todos os outros usuários.<br />
        Você (administrador) continua com acesso completo.
      </p>

    </div>
  );
}
