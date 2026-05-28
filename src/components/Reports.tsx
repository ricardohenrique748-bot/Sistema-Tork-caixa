import React, { useState, useEffect } from 'react';
import { Transaction, Truck, Category, TransactionStatus } from '../types';
import { 
  Filter, 
  Trash2, 
  Download, 
  Printer, 
  FileText, 
  Euro, 
  Search, 
  Receipt,
  X,
  TrendingDown,
  TrendingUp,
  LineChart
} from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  trucks: Truck[];
  onDeleteTransaction: (id: string) => void;
  initialFilterTruck?: string;
  clearInitialFilter?: () => void;
}

export default function Reports({ 
  transactions, 
  trucks, 
  onDeleteTransaction,
  initialFilterTruck,
  clearInitialFilter
}: ReportsProps) {
  
  // Filtering States
  const [selectedTruck, setSelectedTruck] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected receipt preview modal
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  // Sync if filter is initialized externally from Trucks card list
  useEffect(() => {
    if (initialFilterTruck) {
      setSelectedTruck(initialFilterTruck);
      // Clean after setting so the user is free to select other filters
      if (clearInitialFilter) {
        clearInitialFilter();
      }
    }
  }, [initialFilterTruck]);

  // Clean all filters
  const handleClearFilters = () => {
    setSelectedTruck('ALL');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Filter Transaction logically
  const filteredTransactions = transactions.filter((t) => {
    // 1. Truck
    if (selectedTruck !== 'ALL' && t.placa !== selectedTruck) return false;
    
    // 2. Date ranges
    if (startDate && t.data < startDate) return false;
    if (endDate && t.data > endDate) return false;

    // 3. Category
    if (selectedCategory !== 'ALL' && t.categoria !== selectedCategory) return false;

    // 4. Status
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;

    // 5. Search text query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hasEmpresa = t.empresaFavorecido.toLowerCase().includes(q);
      const hasDesc = t.descricaoHistorico.toLowerCase().includes(q);
      const hasDoc = t.numDocumento && t.numDocumento.toLowerCase().includes(q);
      if (!hasEmpresa && !hasDesc && !hasDoc) return false;
    }

    return true;
  });

  // Performance calculations
  const totalEntradas = filteredTransactions
    .filter(t => t.tipo === 'Entrada')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalSaidas = filteredTransactions
    .filter(t => t.tipo === 'Saída')
    .reduce((sum, t) => sum + t.valor, 0);

  const lucroLiquido = totalEntradas - totalSaidas;
  const rentabilidade = totalEntradas > 0 ? (lucroLiquido / totalEntradas) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = ['Data', 'Placa', 'Categoria', 'Empresa/Favorecido', 'Descrição', 'Documento', 'Tipo', 'Valor', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.data,
      t.placa,
      t.categoria,
      t.empresaFavorecido,
      t.descricaoHistorico,
      t.numDocumento || '',
      t.tipo,
      t.valor.toString(),
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TORK_LOG_Relatorio_Caixa_${selectedTruck}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="tork-reports-view">
      
      {/* 1. Header description */}
      <div>
        <h2 className="font-display text-lg font-bold text-[#1A1A1A]">
          Fluxo de Caixa Customizado por Caminhão
        </h2>
        <p className="text-xs text-[#7A6040] mt-1">
          Filtre as movimentações de entrada e saída por período e veículo para gerar o lucro operacional líquido (Entradas - Saídas).
        </p>
      </div>

      {/* 2. Interactive Search & Filters Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A4828] mb-4 flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-[#F5A000]" />
          Filtros de Consultas e Consolidações
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Truck Filter */}
          <div>
            <label className="block text-[10px] text-[#9A8060] font-bold uppercase tracking-widest mb-1.5">
              Filtrar por Caminhão / Placa
            </label>
            <select
              value={selectedTruck}
              onChange={(e) => setSelectedTruck(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2 text-xs font-semibold text-[#1A1A1A] focus:ring-2 focus:ring-[#F5A000]"
            >
              <option value="ALL">Visualizar Toda a Frota</option>
              {trucks.map((t) => (
                <option key={t.placa} value={t.placa}>
                  {t.placa} - {t.modelo.split(' ')[0]} ({t.motorista.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] text-[#9A8060] font-bold uppercase tracking-widest mb-1.5">
              Período de Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2 text-xs font-semibold text-[#1A1A1A] focus:ring-2 focus:ring-[#F5A000]"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] text-[#9A8060] font-bold uppercase tracking-widest mb-1.5">
              Período Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2 text-xs font-semibold text-[#1A1A1A] focus:ring-2 focus:ring-[#F5A000]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] text-[#9A8060] font-bold uppercase tracking-widest mb-1.5">
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2 text-xs font-semibold text-[#1A1A1A] focus:ring-2 focus:ring-[#F5A000]"
            >
              <option value="ALL">Todas as Categorias</option>
              <option value="Frete (Entrada)">Frete (Entrada)</option>
              <option value="Combustível">Combustível</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Peças">Peças</option>
              <option value="Pneus">Pneus</option>
              <option value="Impostos">Impostos (IPVA)</option>
              <option value="Seguros">Seguros</option>
              <option value="Financiamento">Financiamento</option>
              <option value="Salários/Diárias">Salários / Diárias</option>
              <option value="Outros">Outras saídas</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] text-[#9A8060] font-bold uppercase tracking-widest mb-1.5">
              Status Administrativo
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2 text-xs font-semibold text-[#1A1A1A] focus:ring-2 focus:ring-[#F5A000]"
            >
              <option value="ALL">Pendente / Pago / Agendado</option>
              <option value="Pago">Pago (Liquidado)</option>
              <option value="Pendente">Pendente</option>
              <option value="Agendado">Agendado (Provisão)</option>
            </select>
          </div>

        </div>

        {/* Free text search and Clean Filter Button row */}
        <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9A8060]" />
            <input
              type="text"
              placeholder="Pesquisar por histórico, número do documento ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl pl-8 p-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#F5A000]"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="text-xs text-[#C07800] hover:text-[#1A1A1A] font-bold bg-[#FFF0D4] hover:bg-[#FFCF70] px-3 py-1.5 rounded-xl transition"
          >
            Limpar Filtros e Resetar Consulta
          </button>
        </div>
      </div>

      {/* 3. Operational Lucro Liquido Dynamic Math Dashboard */}
      <div className="bg-[#1A1A1A] text-white rounded-2xl shadow-md p-5 grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="border-r border-white/10 last:border-0 pr-4">
          <p className="text-[10px] uppercase font-bold text-[#FFD09A] tracking-wider">
            Faturamento Filtrado
          </p>
          <p className="font-display text-xl font-bold text-[#FFB700] mt-1">
            {formatCurrency(totalEntradas)}
          </p>
          <span className="text-[9px] text-white/40 font-mono">
            {filteredTransactions.filter(t => t.tipo === 'Entrada').length} entradas
          </span>
        </div>

        <div className="border-r border-white/10 last:border-0 pr-4">
          <p className="text-[10px] uppercase font-bold text-[#FFD09A] tracking-wider">
            Custos Filtrados
          </p>
          <p className="font-display text-xl font-bold text-rose-300 mt-1">
            {formatCurrency(totalSaidas)}
          </p>
          <span className="text-[9px] text-white/40 font-mono">
            {filteredTransactions.filter(t => t.tipo === 'Saída').length} saídas
          </span>
        </div>

        <div className="border-r border-white/10 last:border-0 pr-4">
          <p className="text-[10px] uppercase font-bold text-[#FFD09A] tracking-wider">
            Lucro Líquido
          </p>
          <p className={`font-display text-xl font-bold mt-1 ${lucroLiquido >= 0 ? 'text-white' : 'text-rose-300'}`}>
            {formatCurrency(lucroLiquido)}
          </p>
          <span className="text-[9px] text-white/40">
            Margem de {rentabilidade.toFixed(1)}%
          </span>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <p className="text-[11px] font-medium text-white/50 leading-relaxed">
            {selectedTruck === 'ALL' ? 'Consolidado — toda a frota' : `Placa ${selectedTruck}`}
          </p>
          <div className="flex gap-2">
            <button onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition">
              <Download className="h-3 w-3" /> CSV
            </button>
            <button onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition">
              <Printer className="h-3 w-3" /> Imprimir
            </button>
          </div>
        </div>

      </div>

      {/* 4. Transactions List Table / Mobile views */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 overflow-hidden">
        <div className="bg-[#f9f9f9] border-b border-[#FDDCAA] px-4 py-3 flex justify-between items-center">
          <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest block">
            Extrato de Lançamento Ativo
          </span>
          <span className="text-xs text-[#5A4828] font-bold bg-white border border-[#FDDCAA] px-2 py-0.5 rounded-full">
            {filteredTransactions.length} linhas
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center p-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum lançamento corresponde ao filtro</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Experimente alterar o período consultado, selecionar outra placa ou limpar a caixa de pesquisa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="min-w-full text-xs text-slate-750 hidden md:table" id="reports-ledger-table">
              <thead>
                <tr className="border-b border-[#FDDCAA] text-[#9A8060] text-left uppercase tracking-wider font-semibold bg-[#f9f9f9]">
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Placa</th>
                  <th className="py-2.5 px-4">Categoria</th>
                  <th className="py-2.5 px-4">Favorecido / Empresa</th>
                  <th className="py-2.5 px-4">Descrição do Lançamento</th>
                  <th className="py-2.5 px-4">Doc/Nota</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Valor R$</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Docs/Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f9f9f9] transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#5A4828]">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold border border-[#FDDCAA] px-1.5 py-0.5 rounded-md bg-[#f9f9f9] text-[#1A1A1A] font-mono text-[10px]">
                        {t.placa}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#7A6040] font-medium">{t.categoria}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                      {t.empresaFavorecido}
                    </td>
                    <td className="py-3.5 px-4 text-[#7A6040] font-medium">
                      {t.descricaoHistorico}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#9A8060]">
                      {t.numDocumento || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.tipo === 'Entrada' ? 'bg-[#FFF0D4] text-[#C07800]' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {t.tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A1A]">
                      {formatCurrency(t.valor)}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {t.comprovanteUrl && (
                          <button
                            onClick={() => setActiveReceiptUrl(t.comprovanteUrl || null)}
                            className="text-[#5A4828] hover:text-[#1A1A1A] p-1 bg-[#FFF0D4] hover:bg-[#FFCF70] rounded-lg text-xs inline-flex items-center gap-1 font-bold transition"
                            title="Ver Comprovante"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="text-[#9A8060] hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition"
                          title="Remover movimentação"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards-Based List View */}
            <div className="block md:hidden divide-y divide-slate-150 p-3 bg-slate-50/50">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="py-3 space-y-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-bold border border-slate-200 px-1 py-0.5 rounded text-[10px] bg-white font-mono">
                      {t.placa}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{t.empresaFavorecido}</h4>
                      <p className="text-[11px] text-[#9A8060] font-semibold">{t.categoria}</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">{t.descricaoHistorico}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{formatCurrency(t.valor)}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold inline-block mt-1 ${
                        t.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {t.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 bg-white/60 p-1.5 rounded">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${
                      t.status === 'Pago' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : t.status === 'Pendente' 
                        ? 'bg-amber-50 text-amber-800 border-amber-250' 
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {t.status}
                    </span>

                    <div className="flex space-x-2">
                      {t.comprovanteUrl && (
                        <button
                          onClick={() => setActiveReceiptUrl(t.comprovanteUrl || null)}
                          className="text-blue-600 font-bold text-[9px] uppercase bg-blue-50 px-2 py-1 rounded"
                        >
                          Ver Comprovante
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-red-650 font-bold text-[9px] uppercase hover:bg-red-50 p-1 rounded inline-flex items-center gap-0.5"
                      >
                        <Trash2 className="h-3 w-3 shrink-0" /> Excluir
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* 5. Comprovante Modal Preview */}
      {activeReceiptUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#f0f0f0] pb-2">
              <h3 className="font-display text-sm font-bold text-[#1A1A1A]">
                Visualização do Comprovante
              </h3>
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="text-[#9A8060] hover:text-[#1A1A1A] bg-[#f9f9f9] p-1 rounded-full transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex justify-center bg-slate-900/5 p-2 rounded-lg border border-slate-150 max-h-96 overflow-hidden">
              <img 
                src={activeReceiptUrl} 
                alt="Comprovante de pagamento" 
                className="object-contain max-h-80 select-none rounded hover:scale-105 transition duration-200"
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="text-[11px] text-slate-450 leading-relaxed text-center">
              Foto/Documento anexado pelo motorista através do painel de Lançamento Rápido no smartphone.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="bg-[#1A1A1A] hover:bg-[#CC8800] text-white font-bold text-xs uppercase px-4 py-2 rounded-xl transition"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
