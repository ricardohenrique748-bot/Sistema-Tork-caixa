import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction, Truck, MaintenanceAlert } from './types';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import QuickForm from './components/QuickForm';
import TrucksList from './components/TrucksList';
import Reports from './components/Reports';
import Login from './components/Login';
import DatabaseView from './components/DatabaseView';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('tork_auth') === '1'
  );
  const [isMaster, setIsMaster] = useState(false);
  const [systemDisabled, setSystemDisabled] = useState(
    () => localStorage.getItem('tork_system_disabled') === '1'
  );
  const [activeTab, setActiveTab]   = useState('inicio');
  const [loading, setLoading]       = useState(true);
  const [trucks, setTrucks]         = useState<Truck[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts]         = useState<MaintenanceAlert[]>([]);
  const [initialFilterTruck, setInitialFilterTruck] = useState('');
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>(
    () => { try { return JSON.parse(localStorage.getItem('tork_trash') ?? '[]'); } catch { return []; } }
  );

  const saveTrashed = (v: Transaction[]) => {
    setTrashedTransactions(v);
    localStorage.setItem('tork_trash', JSON.stringify(v));
  };

  // ── Load data from Supabase ──
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAll();
  }, [isAuthenticated]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [{ data: tr }, { data: tx }, { data: al }] = await Promise.all([
        supabase.from('trucks').select('*'),
        supabase.from('transactions').select('*').order('data', { ascending: false }),
        supabase.from('alerts').select('*'),
      ]);

      setTrucks((tr ?? []) as Truck[]);
      setTransactions((tx ?? []) as Transaction[]);
      setAlerts((al ?? []) as MaintenanceAlert[]);
    } catch (err) {
      console.error('Supabase load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Operations ──
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const txWithId: Transaction = { ...newTx, id: `tx-${Date.now()}` };
    setTransactions(prev => [txWithId, ...prev]);
    const { error } = await supabase.from('transactions').insert(txWithId);
    if (error) console.error('Erro ao salvar movimentação:', error.message);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Mover esta movimentação para a lixeira?')) return;
    const tx = transactions.find(t => t.id === id);
    if (tx) saveTrashed([tx, ...trashedTransactions]);
    setTransactions(prev => prev.filter(t => t.id !== id));
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.error('Erro ao excluir movimentação:', error.message);
  };

  const handleRestoreTransaction = async (tx: Transaction) => {
    saveTrashed(trashedTransactions.filter(t => t.id !== tx.id));
    setTransactions(prev => [tx, ...prev]);
    const { error } = await supabase.from('transactions').insert(tx);
    if (error) console.error('Erro ao restaurar movimentação:', error.message);
  };

  const handlePermanentDeleteTransaction = (id: string) => {
    if (!window.confirm('Excluir permanentemente? Esta ação não pode ser desfeita.')) return;
    saveTrashed(trashedTransactions.filter(t => t.id !== id));
  };

  const handleAddTruck = async (newTruck: Truck) => {
    setTrucks(prev => [...prev, newTruck]);
    const { error } = await supabase.from('trucks').insert(newTruck);
    if (error) console.error('Erro ao salvar caminhão:', error.message);
  };

  const handleDeleteTruck = async (placa: string) => {
    if (!window.confirm(`Excluir o caminhão ${placa}? Esta ação não pode ser desfeita.`)) return;
    setTrucks(prev => prev.filter(t => t.placa !== placa));
    const { error } = await supabase.from('trucks').delete().eq('placa', placa);
    if (error) console.error('Erro ao excluir caminhão:', error.message);
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    const { error } = await supabase.from('alerts').delete().eq('id', alertId);
    if (error) console.error('Erro ao excluir alerta:', error.message);
  };

  const handleAddAlert = async (alert: { placa: string; tipo: 'IPVA' | 'Seguro' | 'Manutenção' | 'Outros'; descricao: string; status: 'critical' | 'warning' | 'normal' }) => {
    const freshAlert: MaintenanceAlert = { ...alert, id: `alert-${Date.now()}` };
    setAlerts(prev => [freshAlert, ...prev]);
    const { error } = await supabase.from('alerts').insert(freshAlert);
    if (error) console.error('Erro ao salvar alerta:', error.message);
  };

  const handleSelectTruckFromDashboard = (placa: string) => {
    setInitialFilterTruck(placa); setActiveTab('relatorios');
  };
  const handleFilterByTruckFromList = (placa: string) => {
    setInitialFilterTruck(placa); setActiveTab('relatorios');
  };

  const totalBalance = transactions.reduce((sum, t) =>
    t.tipo === 'Entrada' ? sum + t.valor : sum - t.valor, 0);

  const handleLogout = () => {
    localStorage.removeItem('tork_auth');
    setIsAuthenticated(false);
  };

  const handleLogin = (master: boolean) => {
    setIsAuthenticated(true);
    setIsMaster(master);
  };

  const handleToggleSystem = () => {
    const next = !systemDisabled;
    setSystemDisabled(next);
    localStorage.setItem('tork_system_disabled', next ? '1' : '0');
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  if (systemDisabled && !isMaster) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 font-mono text-white select-none">

      {/* Código de erro */}
      <p className="text-[120px] sm:text-[180px] font-black leading-none text-white/5 absolute pointer-events-none">
        404
      </p>

      <div className="relative flex flex-col items-center gap-6 text-center">

        {/* Badge de status */}
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          503 Service Unavailable
        </div>

        {/* Título */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Erro <span className="text-[#F5A000]">404</span>
          </h1>
          <p className="text-white/30 text-sm mt-3 max-w-sm leading-relaxed">
            A página que você tentou acessar não está disponível no momento.
            O servidor retornou um erro inesperado.
          </p>
        </div>

        {/* Caixa de detalhes estilo terminal */}
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-4 text-left text-[11px] text-white/40 leading-6">
          <p><span className="text-[#F5A000]">GET</span> /dashboard → <span className="text-rose-400">404 Not Found</span></p>
          <p><span className="text-white/20">timestamp:</span> {new Date().toISOString()}</p>
          <p><span className="text-white/20">message:</span> Resource temporarily unavailable</p>
          <p><span className="text-white/20">code:</span> SYSTEM_MAINTENANCE</p>
        </div>

        <p className="text-white/20 text-[10px]">
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>

    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">

      {/* Barra de progresso no topo */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full bg-[#F5A000] rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Caminhão em movimento */}
      <div className="relative overflow-hidden" style={{ width: '320px', height: '96px' }}>
        {/* Pista */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '2px', background: '#E5DDD0' }} />
        {/* Faixas da pista animadas */}
        <motion.div
          className="absolute bottom-0 flex"
          style={{ gap: '32px' }}
          animate={{ x: ['0px', '-120px'] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: '40px', height: '2px', background: '#F5A000', opacity: 0.35 }} />
          ))}
        </motion.div>

        {/* Caminhão */}
        <motion.div
          className="absolute"
          style={{ bottom: '2px' }}
          animate={{ x: ['-220px', '340px'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 0.3 }}
        >
          <svg width="200" height="86" viewBox="0 0 200 86" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes ws { to { transform: rotate(360deg); } }
              .ws { animation: ws 0.45s linear infinite; transform-box: fill-box; transform-origin: center; }
            `}</style>

            {/* Baú do trailer */}
            <rect x="2" y="4" width="118" height="54" rx="4" fill="#1A1A1A"/>
            <rect x="5" y="7" width="112" height="48" rx="3" fill="#1E1E1E"/>
            <text x="20" y="38" fill="#F5A000" fontSize="16" fontWeight="800" fontFamily="sans-serif" letterSpacing="3">TORK</text>

            {/* Engate */}
            <rect x="120" y="37" width="8" height="9" rx="1" fill="#333"/>

            {/* Cabine */}
            <rect x="126" y="16" width="66" height="42" rx="6" fill="#1A1A1A"/>
            {/* Para-brisa */}
            <rect x="130" y="20" width="46" height="28" rx="4" fill="#1C2E4A"/>
            <rect x="130" y="20" width="46" height="11" rx="4" fill="#F5A000" opacity="0.88"/>
            {/* Porta */}
            <rect x="131" y="35" width="20" height="21" rx="2" fill="#141414"/>
            {/* Farol */}
            <rect x="188" y="38" width="8" height="10" rx="2" fill="#FFFDE7"/>
            {/* Grade */}
            <rect x="188" y="28" width="8" height="9" rx="1" fill="#333"/>
            <line x1="190" y1="28" x2="190" y2="37" stroke="#444" strokeWidth="1"/>
            <line x1="193" y1="28" x2="193" y2="37" stroke="#444" strokeWidth="1"/>
            {/* Escapamento */}
            <rect x="176" y="1" width="5" height="18" rx="2.5" fill="#555"/>

            {/* Roda 1 – trailer dianteira */}
            <circle cx="30" cy="67" r="13" fill="#111"/>
            <circle cx="30" cy="67" r="9" fill="#2A2A2A"/>
            <g className="ws">
              <line x1="30" y1="58" x2="30" y2="76" stroke="#555" strokeWidth="2.5"/>
              <line x1="21" y1="67" x2="39" y2="67" stroke="#555" strokeWidth="2.5"/>
              <line x1="24" y1="61" x2="36" y2="73" stroke="#555" strokeWidth="1.5"/>
              <line x1="36" y1="61" x2="24" y2="73" stroke="#555" strokeWidth="1.5"/>
            </g>
            <circle cx="30" cy="67" r="3.5" fill="#777"/>

            {/* Roda 2 – trailer traseira */}
            <circle cx="76" cy="67" r="13" fill="#111"/>
            <circle cx="76" cy="67" r="9" fill="#2A2A2A"/>
            <g className="ws">
              <line x1="76" y1="58" x2="76" y2="76" stroke="#555" strokeWidth="2.5"/>
              <line x1="67" y1="67" x2="85" y2="67" stroke="#555" strokeWidth="2.5"/>
              <line x1="70" y1="61" x2="82" y2="73" stroke="#555" strokeWidth="1.5"/>
              <line x1="82" y1="61" x2="70" y2="73" stroke="#555" strokeWidth="1.5"/>
            </g>
            <circle cx="76" cy="67" r="3.5" fill="#777"/>

            {/* Roda 3 – cabine */}
            <circle cx="162" cy="67" r="13" fill="#111"/>
            <circle cx="162" cy="67" r="9" fill="#2A2A2A"/>
            <g className="ws">
              <line x1="162" y1="58" x2="162" y2="76" stroke="#555" strokeWidth="2.5"/>
              <line x1="153" y1="67" x2="171" y2="67" stroke="#555" strokeWidth="2.5"/>
              <line x1="156" y1="61" x2="168" y2="73" stroke="#555" strokeWidth="1.5"/>
              <line x1="168" y1="61" x2="156" y2="73" stroke="#555" strokeWidth="1.5"/>
            </g>
            <circle cx="162" cy="67" r="3.5" fill="#777"/>
          </svg>
        </motion.div>
      </div>

      {/* Texto */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <p className="font-display text-base font-bold text-[#1A1A1A]">
          Tork <span className="text-[#F5A000]">Locações</span>
        </p>
        <p className="text-[#9A8060] text-xs mt-1">Carregando dados da frota...</p>
      </motion.div>

    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans" id="tork-root-app">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBalance={totalBalance}
        username="tork"
        onLogout={handleLogout}
        isMaster={isMaster}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-all">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div key="inicio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <Dashboard transactions={transactions} trucks={trucks} alerts={alerts} dismissAlert={handleDismissAlert} onSelectTruck={handleSelectTruckFromDashboard} />
            </motion.div>
          )}
          {activeTab === 'lancar' && (
            <motion.div key="lancar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <QuickForm trucks={trucks} onAddTransaction={handleAddTransaction} onAddAlert={handleAddAlert} />
            </motion.div>
          )}
          {activeTab === 'caminhoes' && (
            <motion.div key="caminhoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <TrucksList trucks={trucks} transactions={transactions} onAddTruck={handleAddTruck} onDeleteTruck={handleDeleteTruck} onFilterByTruck={handleFilterByTruckFromList} />
            </motion.div>
          )}
          {activeTab === 'relatorios' && (
            <motion.div key="relatorios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <Reports transactions={transactions} trucks={trucks} onDeleteTransaction={handleDeleteTransaction} initialFilterTruck={initialFilterTruck} clearInitialFilter={() => setInitialFilterTruck('')} />
            </motion.div>
          )}
          {activeTab === 'database' && (
            <motion.div key="database" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <DatabaseView
                transactions={transactions}
                trucks={trucks}
                onDeleteTransaction={handleDeleteTransaction}
                trashedTransactions={trashedTransactions}
                onRestoreTransaction={handleRestoreTransaction}
                onPermanentDeleteTransaction={handlePermanentDeleteTransaction}
              />
            </motion.div>
          )}
          {activeTab === 'admin' && isMaster && (
            <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <AdminPanel systemDisabled={systemDisabled} onToggleSystem={handleToggleSystem} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-[#1A1A1A] text-white/60 py-5 mt-6" id="tork-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs gap-2">
          <p className="text-white/50 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-white font-bold">TORK LOG</span> — Todos os direitos reservados.
          </p>
          <span className="text-white/40">Controle Individualizado de Frota</span>
        </div>
      </footer>
    </div>
  );
}
