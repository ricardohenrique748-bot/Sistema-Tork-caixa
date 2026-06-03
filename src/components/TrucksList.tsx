import { useState } from 'react';
import { Truck, Transaction } from '../types';
import {
  User, Truck as TruckIcon, History, Plus, CheckCircle2,
  AlertTriangle, Ban, Wrench, X
} from 'lucide-react';

interface TrucksListProps {
  trucks: Truck[];
  transactions: Transaction[];
  onAddTruck: (truck: Truck) => void;
  onFilterByTruck: (placa: string) => void;
}

export default function TrucksList({ trucks, transactions, onAddTruck, onFilterByTruck }: TrucksListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [placa, setPlaca]       = useState('');
  const [modelo, setModelo]     = useState('');
  const [vencIPVA, setVencIPVA] = useState('');
  const [vencSeguro, setVencSeguro] = useState('');
  const [kmAtual, setKmAtual]   = useState('');
  const [proxManut, setProxManut] = useState('');

  const handleAddTruckSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!placa) return;
    onAddTruck({
      placa: placa.toUpperCase(), modelo, motorista: '',
      statusDocumento: 'Regular',
      dataVencimentoIPVA: vencIPVA || '2026-12-31',
      dataVencimentoSeguro: vencSeguro || '2026-12-31',
      kmAtual: parseInt(kmAtual) || 0,
      proximaManutencaoKm: parseInt(proxManut) || 10000,
    });
    setPlaca(''); setModelo('');
    setVencIPVA(''); setVencSeguro(''); setKmAtual(''); setProxManut('');
    setShowAddForm(false);
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const ipvaStatus = (ipvaDate: string) => {
    const days = Math.ceil((new Date(ipvaDate).getTime() - Date.now()) / 86400000);
    if (days < 0)    return { label: `Vencido há ${Math.abs(days)}d`, color: 'rose',   icon: Ban };
    if (days <= 30)  return { label: `Vence em ${days}d`,             color: 'amber',  icon: AlertTriangle };
    return               { label: 'IPVA Regular',                     color: 'emerald', icon: CheckCircle2 };
  };

  // Fleet summary stats
  const fleetBalance = trucks.reduce((sum, truck) => {
    const txs = transactions.filter(t => t.placa === truck.placa);
    const e = txs.filter(t => t.tipo === 'Entrada').reduce((s, t) => s + t.valor, 0);
    const s = txs.filter(t => t.tipo === 'Saída').reduce((s, t) => s + t.valor, 0);
    return sum + (e - s);
  }, 0);

  const alertCount = trucks.filter(t => {
    const days = Math.ceil((new Date(t.dataVencimentoIPVA).getTime() - Date.now()) / 86400000);
    return days < 30;
  }).length;

  const inputCls = "w-full bg-white border border-[#FDDCAA] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#F5A000] focus:outline-none text-[#1A1A1A] transition";
  const labelCls = "block text-[10px] uppercase font-bold text-[#5A4828] mb-1.5 tracking-wider";

  return (
    <div className="space-y-6" id="tork-trucks-container">

      {/* ── Topo: stats + botão ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1A1A1A]">Caminhões da Frota</h2>
          <p className="text-xs text-[#9A8060] mt-0.5">Gestão individual de cada veículo em circulação</p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm transition ${
            showAddForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
          }`}
        >
          {showAddForm ? <><X className="h-4 w-4" /> Cancelar</> : <><Plus className="h-4 w-4" /> Novo Caminhão</>}
        </button>
      </div>

      {/* ── Resumo da frota ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#FDDCAA]/60 p-4 text-center shadow-sm">
          <p className="font-display text-2xl font-bold text-[#1A1A1A]">{trucks.length}</p>
          <p className="text-[10px] text-[#9A8060] uppercase tracking-widest mt-0.5 font-semibold">Veículos</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#FDDCAA]/60 p-4 text-center shadow-sm">
          <p className={`font-display text-2xl font-bold ${alertCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {alertCount}
          </p>
          <p className="text-[10px] text-[#9A8060] uppercase tracking-widest mt-0.5 font-semibold">Alertas Doc.</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#FDDCAA]/60 p-4 text-center shadow-sm">
          <p className={`font-display text-xl font-bold ${fleetBalance >= 0 ? 'text-[#1A1A1A]' : 'text-rose-600'}`}>
            {fmt(fleetBalance)}
          </p>
          <p className="text-[10px] text-[#9A8060] uppercase tracking-widest mt-0.5 font-semibold">Saldo Total</p>
        </div>
      </div>

      {/* ── Formulário novo caminhão ── */}
      {showAddForm && (
        <div className="bg-[#f9f9f9] border border-[#FDDCAA] p-6 rounded-2xl">
          <h3 className="font-display text-sm font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-[#F5A000]" />
            Cadastrar Novo Veículo
          </h3>
          <form onSubmit={handleAddTruckSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Placa</label>
              <input type="text" placeholder="Ex: TORK-3390" value={placa}
                onChange={e => setPlaca(e.target.value)} className={`${inputCls} font-mono font-bold`} />
            </div>
            <div>
              <label className={labelCls}>Modelo / Fabricante</label>
              <input type="text" placeholder="Ex: Volvo FH 540" value={modelo}
                onChange={e => setModelo(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>KM Atual do Painel</label>
              <input type="number" placeholder="Ex: 84000" value={kmAtual}
                onChange={e => setKmAtual(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vencimento IPVA</label>
              <input type="date" value={vencIPVA} onChange={e => setVencIPVA(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vencimento Seguro</label>
              <input type="date" value={vencSeguro} onChange={e => setVencSeguro(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Próxima Revisão (KM)</label>
              <input type="number" placeholder="Ex: 90000" value={proxManut}
                onChange={e => setProxManut(e.target.value)} className={inputCls} />
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full bg-[#1A1A1A] hover:bg-[#F5A000] text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition shadow-sm">
                Confirmar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lista de caminhões ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden" id="trucks-grid">

        {/* Cabeçalho da lista */}
        <div className="bg-[#f9f9f9] border-b border-[#FDDCAA]/40 px-5 py-3 hidden md:grid grid-cols-12 gap-4 text-[10px] font-bold text-[#9A8060] uppercase tracking-widest">
          <div className="col-span-3">Veículo / Motorista</div>
          <div className="col-span-2 text-right">Receita</div>
          <div className="col-span-2 text-right">Despesa</div>
          <div className="col-span-2 text-right">Saldo</div>
          <div className="col-span-2">Revisão KM</div>
          <div className="col-span-1 text-right">Doc.</div>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          {trucks.map((truck) => {
            const txs      = transactions.filter(t => t.placa === truck.placa);
            const entradas = txs.filter(t => t.tipo === 'Entrada').reduce((s, t) => s + t.valor, 0);
            const saidas   = txs.filter(t => t.tipo === 'Saída').reduce((s, t) => s + t.valor, 0);
            const saldo    = entradas - saidas;
            const margin   = entradas > 0 ? (saldo / entradas) * 100 : 0;

            const startKm  = truck.proximaManutencaoKm - 10000;
            const kmPct    = Math.min(100, Math.max(0, ((truck.kmAtual - startKm) / 10000) * 100));
            const kmColor  = kmPct >= 90 ? 'bg-rose-500' : kmPct >= 70 ? 'bg-amber-400' : 'bg-[#F5A000]';

            const ipva     = ipvaStatus(truck.dataVencimentoIPVA);
            const IpvaIcon = ipva.icon;
            const stripColor = ipva.color === 'rose' ? '#ef4444' : ipva.color === 'amber' ? '#f59e0b' : '#F5A000';

            return (
              <div
                key={truck.placa}
                className="group hover:bg-[#fffaf5] transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 items-center">

                  {/* Veículo + motorista */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: stripColor }} />
                    <div className="min-w-0">
                      <span className="font-mono font-black text-xs text-white bg-[#1A1A1A] px-2 py-0.5 rounded-md tracking-wide">
                        {truck.placa}
                      </span>
                      <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5 truncate">{truck.modelo}</p>
                      <p className="text-[10px] text-[#9A8060] truncate flex items-center gap-1 mt-0.5">
                        <User className="h-2.5 w-2.5 shrink-0" />{truck.motorista}
                      </p>
                    </div>
                  </div>

                  {/* Receita */}
                  <div className="col-span-2 text-right">
                    <p className="text-xs font-mono font-bold text-emerald-700">+{fmt(entradas)}</p>
                    <p className="text-[9px] text-[#9A8060] mt-0.5">{txs.filter(t=>t.tipo==='Entrada').length} fretes</p>
                  </div>

                  {/* Despesa */}
                  <div className="col-span-2 text-right">
                    <p className="text-xs font-mono font-bold text-rose-600">−{fmt(saidas)}</p>
                    <p className="text-[9px] text-[#9A8060] mt-0.5">{txs.filter(t=>t.tipo==='Saída').length} saídas</p>
                  </div>

                  {/* Saldo */}
                  <div className="col-span-2 text-right">
                    <p className={`text-sm font-display font-bold ${saldo >= 0 ? 'text-[#1A1A1A]' : 'text-rose-600'}`}>
                      {fmt(saldo)}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      margin >= 40 ? 'bg-emerald-50 text-emerald-700'
                      : margin >= 0 ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                    }`}>
                      {margin.toFixed(0)}% marg.
                    </span>
                  </div>

                  {/* KM gauge */}
                  <div className="col-span-2">
                    <div className="flex justify-between text-[9px] text-[#9A8060] mb-1">
                      <span className="flex items-center gap-0.5">
                        <Wrench className="h-2.5 w-2.5" />
                        {truck.kmAtual.toLocaleString('pt-BR')} km
                      </span>
                      <span>{kmPct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${kmColor}`}
                           style={{ width: `${kmPct}%` }} />
                    </div>
                    {kmPct >= 90 && (
                      <p className="text-[9px] text-rose-600 font-bold mt-0.5 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />Revisão urgente
                      </p>
                    )}
                  </div>

                  {/* Doc status + ação */}
                  <div className="col-span-1 flex flex-col items-end gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${
                      ipva.color === 'rose'   ? 'bg-red-50 text-red-700 border-red-200'
                      : ipva.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      <IpvaIcon className="h-2.5 w-2.5" />
                      IPVA
                    </span>
                    <button
                      onClick={() => onFilterByTruck(truck.placa)}
                      className="inline-flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#F5A000] text-white text-[9px] font-bold uppercase px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <History className="h-2.5 w-2.5" />Ver
                    </button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="md:hidden px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: stripColor }} />
                      <div>
                        <span className="font-mono font-black text-xs text-white bg-[#1A1A1A] px-2 py-0.5 rounded-md">
                          {truck.placa}
                        </span>
                        <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5">{truck.modelo}</p>
                      </div>
                    </div>
                    <p className={`font-display text-base font-bold ${saldo >= 0 ? 'text-[#1A1A1A]' : 'text-rose-600'}`}>
                      {fmt(saldo)}
                    </p>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9A8060] mb-2">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{truck.motorista}</span>
                    <span className="text-emerald-600 font-bold">{fmt(entradas)}</span>
                  </div>
                  <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${kmColor}`} style={{ width: `${kmPct}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      ipva.color === 'rose' ? 'bg-red-50 text-red-700 border-red-200'
                      : ipva.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>{ipva.label}</span>
                    <button onClick={() => onFilterByTruck(truck.placa)}
                      className="flex items-center gap-1 bg-[#1A1A1A] text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg">
                      <History className="h-3 w-3" />Ver Relatório
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
