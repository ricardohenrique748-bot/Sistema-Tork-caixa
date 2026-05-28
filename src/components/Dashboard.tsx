import React from 'react';
import { Transaction, Truck, MaintenanceAlert } from '../types';
import {
  TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldAlert,
  FileCheck, X, Fuel, Landmark, Users, Wrench,
  Shield, Settings2, Package, MoreHorizontal, Wallet
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  trucks: Truck[];
  alerts: MaintenanceAlert[];
  dismissAlert: (id: string) => void;
  onSelectTruck: (placa: string) => void;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bar: string }> = {
  'Combustível':     { icon: Fuel,          color: 'text-amber-600',  bar: 'bg-amber-400' },
  'Financiamento':   { icon: Landmark,       color: 'text-blue-600',   bar: 'bg-blue-400' },
  'Salários/Diárias':{ icon: Users,          color: 'text-violet-600', bar: 'bg-violet-400' },
  'Manutenção':      { icon: Wrench,         color: 'text-orange-600', bar: 'bg-orange-400' },
  'Seguros':         { icon: Shield,         color: 'text-teal-600',   bar: 'bg-teal-400' },
  'Pneus':           { icon: Settings2,      color: 'text-slate-600',  bar: 'bg-slate-400' },
  'Peças':           { icon: Package,        color: 'text-indigo-600', bar: 'bg-indigo-400' },
  'Impostos':        { icon: Wallet,         color: 'text-red-600',    bar: 'bg-red-400' },
  'Outros':          { icon: MoreHorizontal, color: 'text-gray-500',   bar: 'bg-gray-400' },
};

export default function Dashboard({ transactions, trucks, alerts, dismissAlert, onSelectTruck }: DashboardProps) {

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // ── KPI totals ──
  const totalEntradas = transactions.filter(t => t.tipo === 'Entrada').reduce((s, t) => s + t.valor, 0);
  const totalSaidas   = transactions.filter(t => t.tipo === 'Saída').reduce((s, t) => s + t.valor, 0);
  const netProfit     = totalEntradas - totalSaidas;
  const margin        = totalEntradas > 0 ? (netProfit / totalEntradas) * 100 : 0;

  const suzanoTotal = transactions.filter(t => t.empresaFavorecido.toLowerCase().includes('suzano')).reduce((s, t) => s + t.valor, 0);
  const deltaTotal  = transactions.filter(t => t.empresaFavorecido.toLowerCase().includes('delta')).reduce((s, t) => s + t.valor, 0);

  // ── Truck performance ──
  const truckData = trucks.map(truck => {
    const txs     = transactions.filter(t => t.placa === truck.placa);
    const entries = txs.filter(t => t.tipo === 'Entrada').reduce((s, t) => s + t.valor, 0);
    const exits   = txs.filter(t => t.tipo === 'Saída').reduce((s, t) => s + t.valor, 0);
    return { ...truck, entries, exits, balance: entries - exits, txCount: txs.length };
  }).sort((a, b) => b.balance - a.balance);


  // ── Category breakdown ──
  const catMap = transactions
    .filter(t => t.tipo === 'Saída')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const topCategories = Object.entries(catMap).sort(([, a], [, b]) => b - a).slice(0, 7);

  const alertBorder: Record<string, string> = {
    critical: 'border-l-red-500 bg-red-50',
    warning:  'border-l-amber-400 bg-amber-50',
    normal:   'border-l-[#F5A000] bg-[#f9f9f9]',
  };

  return (
    <div className="space-y-5" id="tork-dashboard">

      {/* ── 1. KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#FDDCAA]/60 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#7A6040] uppercase tracking-widest">Faturamento Total</p>
              <h3 className="font-display text-[26px] font-bold text-[#1A1A1A] mt-1 leading-none">{fmt(totalEntradas)}</h3>
            </div>
            <div className="bg-[#FFF0D4] p-2.5 rounded-xl"><TrendingUp className="h-5 w-5 text-[#F5A000]" /></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="bg-[#FFF0D4] text-[#CC8800] px-2 py-0.5 rounded-full font-semibold">Receitas</span>
            <span className="text-[#9A8060]">{transactions.filter(t => t.tipo === 'Entrada').length} fretes lançados</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#FDDCAA]/60 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#7A6040] uppercase tracking-widest">Despesa Total</p>
              <h3 className="font-display text-[26px] font-bold text-[#1A1A1A] mt-1 leading-none">{fmt(totalSaidas)}</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl"><TrendingDown className="h-5 w-5 text-rose-500" /></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">Custos</span>
            <span className="text-[#9A8060]">{topCategories.length} categorias de gasto</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#FDDCAA]/60 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#7A6040] uppercase tracking-widest">Lucro Operacional</p>
              <h3 className={`font-display text-[26px] font-bold mt-1 leading-none ${netProfit >= 0 ? 'text-[#1A1A1A]' : 'text-rose-600'}`}>
                {fmt(netProfit)}
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl ${netProfit >= 0 ? 'bg-[#FFF0D4]' : 'bg-rose-50'}`}>
              <Activity className={`h-5 w-5 ${netProfit >= 0 ? 'text-[#F5A000]' : 'text-rose-500'}`} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-semibold ${netProfit >= 0 ? 'bg-[#FFF0D4] text-[#CC8800]' : 'bg-rose-50 text-rose-600'}`}>
              {margin.toFixed(1)}% margem
            </span>
            <span className="text-[#9A8060]">Retorno líquido da frota</span>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl shadow-md p-5 text-white">
          <p className="text-[11px] font-semibold text-[#FFD09A] uppercase tracking-widest">Suzano + Delta</p>
          <h3 className="font-display text-[26px] font-bold text-white mt-1 leading-none">{fmt(suzanoTotal + deltaTotal)}</h3>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#FFD09A]">
              <span>Suzano Celulose</span>
              <span className="font-mono text-[#FFB700] font-semibold">{fmt(suzanoTotal)}</span>
            </div>
            <div className="flex justify-between text-[#FFD09A]">
              <span>Delta Máquinas</span>
              <span className="font-mono text-[#FFB700] font-semibold">{fmt(deltaTotal)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 2. Desempenho por Caminhão ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 p-6">

        {/* Header + legend */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-base font-bold text-[#1A1A1A]">Desempenho por Caminhão</h2>
            <p className="text-[11px] text-[#9A8060] mt-0.5">Receita de frete e despesas totais por placa — clique para abrir o relatório</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-[#7A6040] font-semibold shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm" />
              Entrada
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-sm" />
              Saída
            </span>
          </div>
        </div>

        {(() => {
          const CHART_H = 200;
          const maxRaw  = Math.max(...truckData.flatMap(t => [t.entries, t.exits]), 1);
          const yMax    = Math.ceil(maxRaw / 5000) * 5000;
          const yTicks  = 4;
          const yStep   = yMax / yTicks;
          const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => i * yStep);
          const fmtY     = (v: number) => v === 0 ? 'R$0' : `R$${(v / 1000).toFixed(0)}k`;
          const fmtShort = (v: number) => `R$${(v / 1000).toFixed(1)}k`;
          const pct      = (v: number) => `${(v / yMax) * 100}%`;

          return (
            <div className="flex gap-2">

              {/* Y-axis labels */}
              <div className="shrink-0 w-12 flex flex-col-reverse justify-between text-right"
                   style={{ height: CHART_H }}>
                {yLabels.map(v => (
                  <span key={v} className="text-[10px] font-mono text-[#9A8060] leading-none">{fmtY(v)}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="flex-1 flex flex-col gap-3">

                {/* Bars + grid lines */}
                <div className="relative" style={{ height: CHART_H }}>

                  {/* Dashed grid lines */}
                  {yLabels.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                      style={{ bottom: `${(i / yTicks) * 100}%` }}
                    />
                  ))}

                  {/* Bar groups — one per truck */}
                  <div className="absolute inset-0 flex items-end justify-around px-4">
                    {truckData.map(tk => (
                      <div
                        key={tk.placa}
                        className="flex items-end gap-1.5 cursor-pointer group/bar"
                        style={{ height: '100%' }}
                        onClick={() => onSelectTruck(tk.placa)}
                      >
                        {/* Entrada pill */}
                        <div className="relative w-9" style={{ height: '100%' }}>
                          <div className="absolute inset-0 bg-[#e8f5ee] rounded-full" />
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-emerald-400 rounded-full transition-all duration-700 group-hover/bar:bg-emerald-500"
                            style={{ height: pct(tk.entries) }}
                          >
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <span className="text-[9px] font-bold text-[#1A1A1A]">
                                {fmtShort(tk.entries)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Saída pill */}
                        <div className="relative w-9" style={{ height: '100%' }}>
                          <div className="absolute inset-0 bg-rose-100/60 rounded-full" />
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-rose-400 rounded-full transition-all duration-700 group-hover/bar:bg-rose-500"
                            style={{ height: pct(tk.exits) }}
                          >
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <span className="text-[9px] font-bold text-rose-600">
                                {fmtShort(tk.exits)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-around px-4">
                  {truckData.map(tk => (
                    <div key={tk.placa} className="text-center w-[72px]">
                      <p className="text-[10px] font-mono font-bold text-[#1A1A1A] truncate">{tk.placa}</p>
                      <p className="text-[9px] text-[#9A8060]">{tk.motorista.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Bottom stats — saldo por placa */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-[#f0f0f0]">
          {truckData.map(tk => (
            <div
              key={tk.placa}
              className="bg-[#f9f9f9] rounded-xl p-3 cursor-pointer hover:bg-[#eef6eb] transition"
              onClick={() => onSelectTruck(tk.placa)}
            >
              <p className="text-[9px] text-[#9A8060] uppercase tracking-widest font-semibold mb-1">{tk.placa}</p>
              <p className={`font-display text-sm font-bold ${tk.balance >= 0 ? 'text-[#C07800]' : 'text-rose-600'}`}>
                {fmt(tk.balance)}
              </p>
              <div className="flex justify-between mt-1.5 text-[9px] text-[#9A8060]">
                <span className="text-emerald-600 font-semibold">+{fmt(tk.entries)}</span>
                <span className="text-rose-500 font-semibold">−{fmt(tk.exits)}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── 3. Categorias + Alertas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Despesas por Categoria */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#1A1A1A]">Despesas por Categoria</h2>
              <p className="text-[11px] text-[#9A8060] mt-0.5">Para onde vai cada real gasto pela frota</p>
            </div>
            <span className="text-[10px] font-bold text-[#5A4828] bg-[#FFF0D4] px-2.5 py-1 rounded-full">
              Total: {fmt(totalSaidas)}
            </span>
          </div>

          {topCategories.length === 0 ? (
            <p className="text-xs text-[#9A8060] text-center py-8">Nenhuma despesa lançada ainda.</p>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([cat, val]) => {
                const pct = totalSaidas > 0 ? (val / totalSaidas) * 100 : 0;
                const cfg = categoryConfig[cat] ?? categoryConfig['Outros'];
                const Icon = cfg.icon;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
                        <span className="text-xs font-semibold text-[#1A1A1A]">{cat}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#1A1A1A]">{fmt(val)}</span>
                        <span className="text-[10px] font-semibold text-[#9A8060] w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="font-display text-base font-bold text-[#1A1A1A]">Alertas</h2>
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
              alerts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-[#FFF0D4] text-[#CC8800]'
            }`}>
              {alerts.length} pendente{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-[#FFF0D4] p-3 rounded-2xl mb-2">
                <FileCheck className="h-7 w-7 text-[#F5A000]" />
              </div>
              <p className="text-sm font-bold text-[#1A1A1A]">Tudo em dia!</p>
              <p className="text-xs text-[#9A8060] mt-1 max-w-xs">
                Sem alertas de IPVA, seguro ou revisão.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border-l-4 flex items-start justify-between gap-2 ${alertBorder[alert.status] ?? alertBorder.normal}`}
                >
                  <div className="flex gap-2 min-w-0">
                    <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[10px] bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-slate-800">
                          {alert.placa}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                          alert.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {alert.tipo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{alert.descricao}</p>
                      {alert.dataLimite && (
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                          Venc: {new Date(alert.dataLimite).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── 4. Últimas Movimentações ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden" id="dashboard-recent-ledger">
        <div className="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[#1A1A1A]">Últimas Movimentações</h2>
            <p className="text-[11px] text-[#9A8060]">Histórico recente consolidado da frota</p>
          </div>
          <span className="text-[10px] font-bold bg-[#FFF0D4] text-[#CC8800] px-2.5 py-1 rounded-full">
            {transactions.length} no total
          </span>
        </div>

        {/* Desktop table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-[#9A8060] text-left uppercase tracking-wider text-[10px] font-semibold bg-[#f9f9f9]">
                <th className="px-6 py-3">Data</th>
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Favorecido</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Histórico</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {transactions.slice(0, 8).map((t) => {
                const cfg = categoryConfig[t.categoria] ?? categoryConfig['Outros'];
                const Icon = cfg.icon;
                return (
                  <tr key={t.id} className="hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-6 py-3 font-mono text-[#5A4828]">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold border border-[#FDDCAA] px-1.5 py-0.5 rounded-md bg-[#f9f9f9] text-[#1A1A1A] font-mono text-[10px]">
                        {t.placa}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A] max-w-[140px] truncate">{t.empresaFavorecido}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <Icon className={`h-3 w-3 shrink-0 ${cfg.color}`} />
                        <span className="text-[#7A6040]">{t.categoria}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px] truncate text-[#7A6040]" title={t.descricaoHistorico}>
                      {t.descricaoHistorico}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.tipo === 'Entrada' ? 'bg-[#FFF0D4] text-[#C07800]' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {t.tipo === 'Entrada' ? '↑ Receita' : '↓ Custo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold ${t.tipo === 'Entrada' ? 'text-[#C07800]' : 'text-[#1A1A1A]'}`}>
                        {t.tipo === 'Entrada' ? '+' : '-'}{fmt(t.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        t.status === 'Pago'
                          ? 'bg-[#FFF0D4] text-[#C07800] border-[#FDDCAA]'
                          : t.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#f0f0f0]">
          {transactions.slice(0, 8).map((t) => {
            const cfg = categoryConfig[t.categoria] ?? categoryConfig['Outros'];
            const Icon = cfg.icon;
            return (
              <div key={t.id} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[10px] bg-[#f9f9f9] border border-[#FDDCAA] px-1.5 py-0.5 rounded-md text-[#1A1A1A]">
                        {t.placa}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        t.tipo === 'Entrada' ? 'bg-[#FFF0D4] text-[#C07800]' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {t.tipo === 'Entrada' ? '↑ Receita' : '↓ Custo'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1A1A1A] mt-1 truncate">{t.empresaFavorecido}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon className={`h-3 w-3 shrink-0 ${cfg.color}`} />
                      <p className="text-[10px] text-[#9A8060]">{t.categoria} · {new Date(t.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className={`text-sm font-bold font-mono ${t.tipo === 'Entrada' ? 'text-[#C07800]' : 'text-[#1A1A1A]'}`}>
                      {t.tipo === 'Entrada' ? '+' : '-'}{fmt(t.valor)}
                    </p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                      t.status === 'Pago'
                        ? 'bg-[#FFF0D4] text-[#C07800] border-[#FDDCAA]'
                        : t.status === 'Pendente'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {t.status}
                    </span>
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
