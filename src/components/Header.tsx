import { DollarSign, LogOut, User } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalBalance: number;
  username: string;
  onLogout: () => void;
  isMaster?: boolean;
}

export default function Header({ activeTab, setActiveTab, totalBalance, username, onLogout, isMaster }: HeaderProps) {
  const navItems = [
    { id: 'inicio',     label: 'Início'       },
    { id: 'lancar',     label: 'Lançar'       },
    { id: 'caminhoes',  label: 'Caminhões'    },
    { id: 'relatorios', label: 'Relatórios'   },
    { id: 'database',   label: 'Base de Dados'},
    ...(isMaster ? [{ id: 'admin', label: '⚙ Admin' }] : []),
  ];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-[#FDDCAA] sticky top-0 z-50 shadow-sm" id="tork-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="shrink-0 overflow-hidden" style={{ height: '44px' }}>
          <img src="/tork-logo.jpg" alt="Tork Locações" style={{ height: '92px', width: 'auto' }} />
        </div>

        {/* Nav pill */}
        <nav className="hidden md:flex bg-[#FFECD0] rounded-full p-1 gap-0.5 flex-1 justify-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white shadow-sm'
                    : 'text-[#7A5A20] hover:bg-white/60 hover:text-[#1A1A1A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: balance + user + logout */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Balance chip */}
          <div className="flex items-center gap-2 bg-[#1A1A1A] text-white rounded-full px-4 py-2 shadow-sm">
            <DollarSign className="h-3.5 w-3.5 text-[#F5A000] shrink-0" />
            <div className="text-right leading-none">
              <p className="text-[9px] uppercase tracking-widest text-[#FFD09A] font-medium hidden sm:block">Caixa</p>
              <p className={`text-sm font-bold font-display ${totalBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>

          {/* User chip */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#FFECD0] rounded-full pl-2.5 pr-1 py-1 border border-[#FDDCAA]">
            <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] font-mono pr-1">{username}</span>

            {/* Logout button dentro do chip */}
            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="w-6 h-6 rounded-full bg-[#1A1A1A]/10 hover:bg-rose-100 hover:text-rose-600 text-[#1A1A1A] flex items-center justify-center transition-colors"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>

          {/* Logout mobile (só ícone) */}
          <button
            onClick={onLogout}
            title="Sair"
            className="sm:hidden w-8 h-8 rounded-full bg-[#FFECD0] border border-[#FDDCAA] flex items-center justify-center text-[#1A1A1A] hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive ? 'bg-[#1A1A1A] text-white' : 'bg-[#FFECD0] text-[#7A5A20]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
