import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction, Truck, MaintenanceAlert } from './types';
import { INITIAL_TRUCKS, INITIAL_TRANSACTIONS, INITIAL_ALERTS } from './mockData';
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
  const [activeTab, setActiveTab] = useState<string>('inicio');

  // Load from LocalStorage if exists, else load mocks
  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem('tork_trucks');
    return saved ? JSON.parse(saved) : INITIAL_TRUCKS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tork_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(() => {
    const saved = localStorage.getItem('tork_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Track if we clicked on "Ver Movimentação" on a specific truck, to apply a pre-filter
  const [initialFilterTruck, setInitialFilterTruck] = useState<string>('');

  // Persist State Updates
  useEffect(() => {
    localStorage.setItem('tork_trucks', JSON.stringify(trucks));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem('tork_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tork_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Operations
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txWithId: Transaction = {
      ...newTx,
      id: `tx-custom-${Date.now()}`
    };
    setTransactions((prev) => [txWithId, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta movimentação permanentemente?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleAddTruck = (newTruck: Truck) => {
    setTrucks((prev) => [...prev, newTruck]);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Safe manual notification addition on tires/maintenance launches
  const handleAddAlert = (alert: { placa: string; tipo: 'IPVA' | 'Seguro' | 'Manutenção' | 'Outros'; descricao: string; status: 'critical' | 'warning' | 'normal' }) => {
    const freshAlert: MaintenanceAlert = {
      ...alert,
      id: `alert-${Date.now()}`
    };
    setAlerts((prev) => [freshAlert, ...prev]);
  };

  // Navigations Actions
  const handleSelectTruckFromDashboard = (placa: string) => {
    setInitialFilterTruck(placa);
    setActiveTab('relatorios');
  };

  const handleFilterByTruckFromList = (placa: string) => {
    setInitialFilterTruck(placa);
    setActiveTab('relatorios');
  };

  // Sum dynamic global company balance (Total Revenues - Total Expenses)
  const totalBalance = transactions.reduce((sum, t) => {
    return t.tipo === 'Entrada' ? sum + t.valor : sum - t.valor;
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem('tork_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans" id="tork-root-app">
      {/* Header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBalance={totalBalance}
        username="tork"
        onLogout={handleLogout}
      />

      {/* Primary tab content with responsive containers and entry transitions */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-all">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Dashboard 
                transactions={transactions} 
                trucks={trucks} 
                alerts={alerts} 
                dismissAlert={handleDismissAlert}
                onSelectTruck={handleSelectTruckFromDashboard}
              />
            </motion.div>
          )}

          {activeTab === 'lancar' && (
            <motion.div
              key="lancar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <QuickForm 
                trucks={trucks} 
                onAddTransaction={handleAddTransaction} 
                onAddAlert={handleAddAlert}
              />
            </motion.div>
          )}

          {activeTab === 'caminhoes' && (
            <motion.div
              key="caminhoes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <TrucksList 
                trucks={trucks} 
                transactions={transactions} 
                onAddTruck={handleAddTruck} 
                onFilterByTruck={handleFilterByTruckFromList}
              />
            </motion.div>
          )}

          {activeTab === 'relatorios' && (
            <motion.div
              key="relatorios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Reports
                transactions={transactions}
                trucks={trucks}
                onDeleteTransaction={handleDeleteTransaction}
                initialFilterTruck={initialFilterTruck}
                clearInitialFilter={() => setInitialFilterTruck('')}
              />
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div
              key="database"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <DatabaseView
                transactions={transactions}
                trucks={trucks}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/60 py-5 mt-6" id="tork-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs gap-2">
          <p className="text-white/50 font-medium">
            &copy; {new Date().getFullYear()} <span className="text-white font-bold">TORK LOG</span> — Todos os direitos reservados.
          </p>
          <div className="flex gap-3 text-white/40">
            <span>Controle Individualizado de Frota</span>
            <span>·</span>
            <span>Suzano &amp; Delta Máquinas Transportes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
