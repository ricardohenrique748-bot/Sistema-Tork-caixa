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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('tork_auth') === '1'
  );
  const [activeTab, setActiveTab]   = useState('inicio');
  const [loading, setLoading]       = useState(true);
  const [trucks, setTrucks]         = useState<Truck[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts]         = useState<MaintenanceAlert[]>([]);
  const [initialFilterTruck, setInitialFilterTruck] = useState('');

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
    await supabase.from('transactions').insert(txWithId);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta movimentação permanentemente?')) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
  };

  const handleAddTruck = async (newTruck: Truck) => {
    setTrucks(prev => [...prev, newTruck]);
    await supabase.from('trucks').insert(newTruck);
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    await supabase.from('alerts').delete().eq('id', alertId);
  };

  const handleAddAlert = async (alert: { placa: string; tipo: 'IPVA' | 'Seguro' | 'Manutenção' | 'Outros'; descricao: string; status: 'critical' | 'warning' | 'normal' }) => {
    const freshAlert: MaintenanceAlert = { ...alert, id: `alert-${Date.now()}` };
    setAlerts(prev => [freshAlert, ...prev]);
    await supabase.from('alerts').insert(freshAlert);
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

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <div className="overflow-hidden" style={{ height: '52px' }}>
        <img src="/tork-logo.jpg" alt="Tork" style={{ height: '92px', width: 'auto' }} />
      </div>
      <div className="flex items-center gap-3 text-[#9A8060] text-sm">
        <svg className="animate-spin h-5 w-5 text-[#F5A000]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Carregando dados da frota...
      </div>
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
              <TrucksList trucks={trucks} transactions={transactions} onAddTruck={handleAddTruck} onFilterByTruck={handleFilterByTruckFromList} />
            </motion.div>
          )}
          {activeTab === 'relatorios' && (
            <motion.div key="relatorios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <Reports transactions={transactions} trucks={trucks} onDeleteTransaction={handleDeleteTransaction} initialFilterTruck={initialFilterTruck} clearInitialFilter={() => setInitialFilterTruck('')} />
            </motion.div>
          )}
          {activeTab === 'database' && (
            <motion.div key="database" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <DatabaseView transactions={transactions} trucks={trucks} onDeleteTransaction={handleDeleteTransaction} />
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
