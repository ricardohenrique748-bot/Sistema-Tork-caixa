import { useState } from 'react';
import { Transaction, Truck } from '../types';
import {
  Database, Truck as TruckIcon, ArrowUpDown, Trash2, Search,
  Tag, UserPlus, Plus, X, CheckCircle, Shield,
  Eye, EyeOff, ToggleLeft, ToggleRight, RotateCcw, Trash
} from 'lucide-react';

interface DatabaseViewProps {
  transactions: Transaction[];
  trucks: Truck[];
  onDeleteTransaction: (id: string) => void;
  trashedTransactions: Transaction[];
  onRestoreTransaction: (tx: Transaction) => void;
  onPermanentDeleteTransaction: (id: string) => void;
}

// ── Types ──
interface AppUser   { id: string; username: string; password: string; role: 'Admin' | 'Viewer'; active: boolean }
interface Category  { id: string; name: string; type: 'Entrada' | 'Saída'; active: boolean }

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1',  name: 'Frete (Entrada)',  type: 'Entrada', active: true },
  { id: 'cat-2',  name: 'Combustível',      type: 'Saída',   active: true },
  { id: 'cat-3',  name: 'Manutenção',       type: 'Saída',   active: true },
  { id: 'cat-4',  name: 'Peças',            type: 'Saída',   active: true },
  { id: 'cat-5',  name: 'Pneus',            type: 'Saída',   active: true },
  { id: 'cat-6',  name: 'Impostos',         type: 'Saída',   active: true },
  { id: 'cat-7',  name: 'Seguros',          type: 'Saída',   active: true },
  { id: 'cat-8',  name: 'Financiamento',    type: 'Saída',   active: true },
  { id: 'cat-9',  name: 'Salários/Diárias', type: 'Saída',   active: true },
  { id: 'cat-10', name: 'Outros',           type: 'Saída',   active: true },
];

function load<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function save<T>(key: string, val: T) { localStorage.setItem(key, JSON.stringify(val)); }

const inputCls = "w-full bg-white border border-[#FDDCAA] rounded-xl px-3 py-2.5 text-xs text-[#1A1A1A] placeholder-[#9A8060] focus:outline-none focus:ring-2 focus:ring-[#F5A000]/40 focus:border-[#F5A000] transition";
const labelCls = "block text-[10px] font-bold text-[#5A4828] uppercase tracking-widest mb-1.5";

export default function DatabaseView({ transactions, trucks, onDeleteTransaction, trashedTransactions, onRestoreTransaction, onPermanentDeleteTransaction }: DatabaseViewProps) {
  type Tab = 'transactions' | 'trucks' | 'users' | 'categories';
  const [tab, setTab] = useState<Tab>('transactions');
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('data');
  const [sortAsc, setSortAsc] = useState(false);

  // ── State: Usuários ──
  const [users, setUsers] = useState<AppUser[]>(() =>
    load('tork_users', [{ id: 'u-1', username: 'tork', password: '123456', role: 'Admin', active: true }])
  );
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Viewer' as 'Admin' | 'Viewer' });
  const [showPass, setShowPass] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  // ── State: Categorias ──
  const [categories, setCategories] = useState<Category[]>(() => load('tork_categories', DEFAULT_CATEGORIES));
  const [newCat, setNewCat] = useState({ name: '', type: 'Saída' as 'Entrada' | 'Saída' });
  const [showCatForm, setShowCatForm] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleSort = (f: string) => { if (sortField === f) setSortAsc(a => !a); else { setSortField(f); setSortAsc(true); } };
  const SortBtn = ({ field, label }: { field: string; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 group hover:text-[#F5A000] transition-colors">
      {label}<ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-[#F5A000]' : 'opacity-30 group-hover:opacity-70'}`} />
    </button>
  );

  // Persist helpers
  const updateUsers = (v: AppUser[])   => { setUsers(v);      save('tork_users', v); };
const updateCats = (v: Category[])   => { setCategories(v); save('tork_categories', v); };

  // Add handlers
  const addUser = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    updateUsers([...users, { id: `u-${Date.now()}`, ...newUser, active: true }]);
    setNewUser({ username: '', password: '', role: 'Viewer' });
    setShowUserForm(false);
  };
const addCategory = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!newCat.name) return;
    updateCats([...categories, { id: `cat-${Date.now()}`, ...newCat, active: true }]);
    setNewCat({ name: '', type: 'Saída' });
    setShowCatForm(false);
  };

  // Filtered transactions
  const filteredTx = transactions
    .filter(t => !search || [t.placa, t.empresaFavorecido, t.categoria, t.descricaoHistorico]
      .some(f => f.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const va = String((a as any)[sortField] ?? '');
      const vb = String((b as any)[sortField] ?? '');
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const tabs = [
    { id: 'transactions' as Tab, label: 'Movimentações', count: transactions.length,  icon: Database },
    { id: 'trucks'       as Tab, label: 'Caminhões',      count: trucks.length,         icon: TruckIcon },
    { id: 'users'        as Tab, label: 'Usuários',        count: users.length,          icon: Shield },
    { id: 'categories'   as Tab, label: 'Categorias',      count: categories.length,     icon: Tag },
  ];

  return (
    <div className="space-y-5" id="tork-database">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1A1A1A]">Base de Dados</h2>
          <p className="text-xs text-[#9A8060] mt-0.5">Gerenciar registros, usuários, motoristas e categorias</p>
        </div>
        {(tab === 'transactions' || tab === 'trucks') && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9A8060]" />
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-[#FDDCAA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1A1A1A] placeholder-[#9A8060] focus:outline-none focus:ring-2 focus:ring-[#F5A000]/40 focus:border-[#F5A000] transition" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setSearch(''); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              tab === id ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm' : 'bg-white text-[#5A4828] border-[#FDDCAA] hover:border-[#F5A000]'
            }`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === id ? 'bg-white/20 text-white' : 'bg-[#FFF0D4] text-[#CC8800]'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════ Movimentações ══════════ */}
      {tab === 'transactions' && (
        <div className="space-y-3">
          {/* Cabeçalho com toggle lixeira */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showTrash ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                  <Trash className="h-3.5 w-3.5" />
                  Lixeira
                  {trashedTransactions.length > 0 && (
                    <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{trashedTransactions.length}</span>
                  )}
                </span>
              ) : (
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Movimentações</span>
              )}
            </div>
            <button
              onClick={() => setShowTrash(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                showTrash
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#5A4828] border-[#FDDCAA] hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Trash className="h-3 w-3" />
              {showTrash ? 'Ver Ativas' : `Lixeira${trashedTransactions.length > 0 ? ` (${trashedTransactions.length})` : ''}`}
            </button>
          </div>

          {/* Tabela ativa */}
          {!showTrash && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden">
              <div className="bg-[#f9f9f9] border-b border-[#FDDCAA]/40 px-5 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Movimentações</span>
                <span className="text-[10px] font-bold text-[#5A4828] bg-[#FFF0D4] px-2.5 py-1 rounded-full">{filteredTx.length} de {transactions.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-[#f9f9f9] border-b border-[#FDDCAA]/30 text-[#9A8060] text-[10px] font-semibold uppercase tracking-wider">
                      {[['data','Data'],['placa','Placa'],['categoria','Categoria'],['empresaFavorecido','Favorecido']].map(([f,l]) => (
                        <th key={f} className="px-4 py-3 text-left"><SortBtn field={f} label={l} /></th>
                      ))}
                      <th className="px-4 py-3 text-left">Histórico</th>
                      <th className="px-4 py-3 text-left"><SortBtn field="tipo" label="Tipo" /></th>
                      <th className="px-4 py-3 text-right"><SortBtn field="valor" label="Valor" /></th>
                      <th className="px-4 py-3 text-left"><SortBtn field="status" label="Status" /></th>
                      <th className="px-4 py-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTx.map(t => (
                      <tr key={t.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[#5A4828]">{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-2.5"><span className="font-mono font-bold text-[10px] bg-[#f9f9f9] border border-[#FDDCAA] px-1.5 py-0.5 rounded-md">{t.placa}</span></td>
                        <td className="px-4 py-2.5 text-[#7A6040]">{t.categoria}</td>
                        <td className="px-4 py-2.5 font-semibold text-[#1A1A1A] max-w-[130px] truncate">{t.empresaFavorecido}</td>
                        <td className="px-4 py-2.5 text-[#7A6040] max-w-[150px] truncate" title={t.descricaoHistorico}>{t.descricaoHistorico}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{t.tipo}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold">{fmt(t.valor)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${t.status === 'Pago' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button onClick={() => onDeleteTransaction(t.id)} className="p-1.5 rounded-lg text-[#9A8060] hover:text-rose-600 hover:bg-rose-50 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lixeira */}
          {showTrash && (
            <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 overflow-hidden">
              <div className="bg-rose-50 border-b border-rose-200/40 px-5 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Trash className="h-3.5 w-3.5" /> Itens excluídos
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-full">{trashedTransactions.length} item(ns)</span>
              </div>
              {trashedTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Trash className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-[#9A8060]">Lixeira vazia</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-rose-50 border-b border-rose-100 text-[#9A8060] text-[10px] font-semibold uppercase tracking-wider">
                        <th className="px-4 py-3 text-left">Data</th>
                        <th className="px-4 py-3 text-left">Placa</th>
                        <th className="px-4 py-3 text-left">Categoria</th>
                        <th className="px-4 py-3 text-left">Favorecido</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-right">Valor</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {trashedTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-rose-50/40 transition-colors opacity-75">
                          <td className="px-4 py-2.5 font-mono text-[#5A4828]">{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-2.5"><span className="font-mono font-bold text-[10px] bg-[#f9f9f9] border border-[#FDDCAA] px-1.5 py-0.5 rounded-md">{t.placa}</span></td>
                          <td className="px-4 py-2.5 text-[#7A6040]">{t.categoria}</td>
                          <td className="px-4 py-2.5 font-semibold text-[#1A1A1A] max-w-[130px] truncate">{t.empresaFavorecido}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{t.tipo}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold">{fmt(t.valor)}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onRestoreTransaction(t)}
                                title="Restaurar"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-[10px] font-bold transition"
                              >
                                <RotateCcw className="h-3 w-3" /> Restaurar
                              </button>
                              <button
                                onClick={() => onPermanentDeleteTransaction(t.id)}
                                title="Excluir definitivamente"
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════ Caminhões ══════════ */}
      {tab === 'trucks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden">
          <div className="bg-[#f9f9f9] border-b border-[#FDDCAA]/40 px-5 py-3 flex justify-between items-center">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Caminhões</span>
            <span className="text-[10px] font-bold text-[#5A4828] bg-[#FFF0D4] px-2.5 py-1 rounded-full">{trucks.length} veículos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-[#f9f9f9] border-b border-[#FDDCAA]/30 text-[#9A8060] text-[10px] font-semibold uppercase tracking-wider">
                  {['Placa','Modelo','Motorista','KM Atual','Próx. Rev. (KM)','Venc. IPVA','Venc. Seguro','Situação'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trucks.map(t => (
                  <tr key={t.placa} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-4 py-3"><span className="font-mono font-black text-xs bg-[#f9f9f9] border border-[#FDDCAA] px-2 py-0.5 rounded-md">{t.placa}</span></td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{t.modelo}</td>
                    <td className="px-4 py-3 text-[#5A4828]">{t.motorista}</td>
                    <td className="px-4 py-3 font-mono text-[#7A6040]">{t.kmAtual.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-mono text-[#7A6040]">{t.proximaManutencaoKm.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 font-mono text-[#7A6040]">{new Date(t.dataVencimentoIPVA).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 font-mono text-[#7A6040]">{new Date(t.dataVencimentoSeguro).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${t.statusDocumento === 'Regular' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.statusDocumento === 'Vencendo' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{t.statusDocumento}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════ Usuários ══════════ */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#9A8060]">Gerencie quem tem acesso ao sistema TORK LOG</p>
            <button onClick={() => setShowUserForm(v => !v)}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition ${showUserForm ? 'bg-slate-100 text-slate-600' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'}`}>
              {showUserForm ? <><X className="h-3.5 w-3.5" />Cancelar</> : <><UserPlus className="h-3.5 w-3.5" />Novo Usuário</>}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={addUser} className="bg-[#f9f9f9] border border-[#FDDCAA] rounded-2xl p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-[#F5A000]" />Cadastrar Usuário</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div><label className={labelCls}>Usuário *</label>
                  <input type="text" required placeholder="Ex: joao" value={newUser.username} onChange={e => setNewUser(u => ({...u, username: e.target.value}))} className={inputCls} /></div>
                <div><label className={labelCls}>Senha *</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required placeholder="Senha" value={newUser.password} onChange={e => setNewUser(u => ({...u, password: e.target.value}))} className={`${inputCls} pr-9`} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8060]">
                      {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div></div>
                <div><label className={labelCls}>Perfil</label>
                  <select value={newUser.role} onChange={e => setNewUser(u => ({...u, role: e.target.value as any}))} className={inputCls}>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Visualizador</option>
                  </select></div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-[#1A1A1A] hover:bg-[#F5A000] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition">Salvar</button>
                </div>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-[#f9f9f9] border-b border-[#FDDCAA]/30 text-[#9A8060] text-[10px] font-semibold uppercase tracking-wider">
                  {['Usuário','Senha','Perfil','Status','Ação'].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-[#1A1A1A]">{u.username}</td>
                    <td className="px-5 py-3 font-mono text-[#9A8060] tracking-widest">{'•'.repeat(Math.min(u.password.length, 10))}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.role === 'Admin' ? 'bg-[#FFF0D4] text-[#CC8800] border-[#FDDCAA]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => updateUsers(users.map(x => x.id === u.id ? {...x, active: !x.active} : x))}
                        className={`flex items-center gap-1.5 text-[10px] font-bold ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {u.active ? <><ToggleRight className="h-4 w-4" />Ativo</> : <><ToggleLeft className="h-4 w-4" />Inativo</>}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      {u.username !== 'tork' && (
                        <button onClick={() => updateUsers(users.filter(x => x.id !== u.id))}
                          className="p-1.5 rounded-lg text-[#9A8060] hover:text-rose-600 hover:bg-rose-50 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ══════════ Categorias ══════════ */}
      {tab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#9A8060]">Categorias disponíveis na aba Lançar</p>
            <button onClick={() => setShowCatForm(v => !v)}
              className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition ${showCatForm ? 'bg-slate-100 text-slate-600' : 'bg-[#1A1A1A] text-white hover:bg-[#333]'}`}>
              {showCatForm ? <><X className="h-3.5 w-3.5" />Cancelar</> : <><Plus className="h-3.5 w-3.5" />Nova Categoria</>}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={addCategory} className="bg-[#f9f9f9] border border-[#FDDCAA] rounded-2xl p-5">
              <h3 className="font-display text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2"><Tag className="h-4 w-4 text-[#F5A000]" />Nova Categoria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2"><label className={labelCls}>Nome da Categoria *</label>
                  <input type="text" required placeholder="Ex: Pedágio, Lavagem..." value={newCat.name} onChange={e => setNewCat(c => ({...c, name: e.target.value}))} className={inputCls} /></div>
                <div><label className={labelCls}>Tipo</label>
                  <div className="flex gap-2">
                    {(['Entrada', 'Saída'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setNewCat(c => ({...c, type: t}))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${newCat.type === t ? (t === 'Entrada' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300') : 'bg-white text-[#9A8060] border-[#FDDCAA]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end">
                  <button type="submit" className="bg-[#1A1A1A] hover:bg-[#F5A000] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition">Salvar</button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(c => (
              <div key={c.id} className={`bg-white rounded-2xl border p-4 flex items-center justify-between transition ${c.active ? 'border-[#FDDCAA]/60' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${c.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">{c.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.type === 'Entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>{c.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateCats(categories.map(x => x.id === c.id ? {...x, active: !x.active} : x))}
                    title={c.active ? 'Desativar' : 'Ativar'}
                    className={`p-1.5 rounded-lg transition ${c.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                  {!['cat-1','cat-2','cat-3','cat-4','cat-5','cat-6','cat-7','cat-8','cat-9','cat-10'].includes(c.id) && (
                    <button onClick={() => updateCats(categories.filter(x => x.id !== c.id))}
                      className="p-1.5 rounded-lg text-[#9A8060] hover:text-rose-600 hover:bg-rose-50 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
