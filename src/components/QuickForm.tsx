import React, { useState, useRef } from 'react';
import { Transaction, Category, TransactionStatus, TransactionType, Truck } from '../types';
import { FileUp, Landmark, FileImage, ShieldAlert, BadgeInfo, CheckCircle } from 'lucide-react';

interface QuickFormProps {
  trucks: Truck[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onAddAlert?: (alert: { placa: string; tipo: 'IPVA' | 'Seguro' | 'Manutenção' | 'Outros'; descricao: string; status: 'critical' | 'warning' | 'normal' }) => void;
}

export default function QuickForm({ trucks, onAddTransaction, onAddAlert }: QuickFormProps) {
  // Form State
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [placa, setPlaca] = useState(trucks[0]?.placa || '');
  const [categoria, setCategoria] = useState<Category>('Combustível');
  const [empresa, setEmpresa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [numDocumento, setNumDocumento] = useState('');
  const [tipo, setTipo] = useState<TransactionType>('Saída');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('Pago');
  
  // Custom Receipt Attachment
  const [comprovante, setComprovante] = useState<string | null>(null);
  const [comprovanteName, setComprovanteName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState(false);
  const [pneusAlertCreated, setPneusAlertCreated] = useState(false);

  // Auto-set Type based on Category Selection
  const handleCategoryChange = (cat: Category) => {
    setCategoria(cat);
    if (cat === 'Frete (Entrada)') {
      setTipo('Entrada');
    } else {
      setTipo('Saída');
    }
  };

  // Drag and Drop files
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setComprovanteName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setComprovante(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit Transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !empresa || !valor) return;

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) return;

    onAddTransaction({
      data,
      placa,
      categoria,
      empresaFavorecido: empresa,
      descricaoHistorico: descricao || (`Recibo de ${categoria}`),
      numDocumento: numDocumento || undefined,
      tipo,
      valor: valorNumerico,
      status,
      comprovanteUrl: comprovante || undefined,
    });

    // Special Auto-rule: If category is Maintenance or Tires (Pneus), offer to automatically schedule preventative alert
    if ((categoria === 'Manutenção' || categoria === 'Pneus' || categoria === 'Peças') && onAddAlert) {
      onAddAlert({
        placa,
        tipo: 'Manutenção',
        descricao: `Revisão após lançamento de ${categoria} (${descricao || 'Nova Peça'}). Confirmar estado mecânico.`,
        status: 'warning'
      });
    }

    // Reset Form
    setEmpresa('');
    setDescricao('');
    setNumDocumento('');
    setValor('');
    setComprovante(null);
    setComprovanteName('');
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#FDDCAA]/60 p-6 max-w-4xl mx-auto" id="tork-quick-form">
      <div className="border-b border-[#f0f0f0] pb-4 mb-6">
        <h2 className="font-display text-lg font-bold text-[#1A1A1A]">
          Lançamento Rápido de Movimentação
        </h2>
        <p className="text-xs text-[#7A6040] mt-1">
          Utilize o formulário abaixo para registrar receitas de fretes ou despesas de estrada (óleo, combustível, borracheiro ou taxas).
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 flex items-center space-x-3 transition-all">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Lançamento Efetuado!</p>
            <p className="text-xs text-emerald-700">A transação foi adicionada com sucesso e os caixas do caminhão e geral já foram atualizados.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Data, Placa e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Data do Registro *
            </label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Veículo / Placa *
            </label>
            <select
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] transition"
            >
              {trucks.map((t) => (
                <option key={t.placa} value={t.placa}>
                  {t.placa} - {t.modelo.split(' ')[0]} ({t.motorista.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Categoria *
            </label>
            <select
              value={categoria}
              onChange={(e) => handleCategoryChange(e.target.value as Category)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] transition"
            >
              <option value="Frete (Entrada)">Frete (Entrada - Receita)</option>
              <option value="Combustível">Combustível</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Peças">Peças</option>
              <option value="Pneus">Pneus</option>
              <option value="Impostos">Impostos (IPVA / Doc)</option>
              <option value="Seguros">Seguros</option>
              <option value="Financiamento">Financiamento</option>
              <option value="Salários/Diárias">Salários / Diárias</option>
              <option value="Outros">Outros gastos</option>
            </select>
          </div>
        </div>

        {/* Row 2: Empresa, Nº Documento and Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Empresa / Favorecido *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Suzano, Posto Iccar, Allianz"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] placeholder-[#a8bfa8] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Nº Documento / Nota Fiscal
            </label>
            <input
              type="text"
              placeholder="Opcional (Ex: NF-1249)"
              value={numDocumento}
              onChange={(e) => setNumDocumento(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] placeholder-[#a8bfa8] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Tipo do Fluxo
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('Entrada')}
                className={`w-1/2 rounded-xl p-2 text-xs font-bold border transition ${
                  tipo === 'Entrada'
                    ? 'bg-[#FFF0D4] text-[#C07800] border-[#FFCF70]'
                    : 'bg-[#f9f9f9] text-[#9A8060] border-[#FDDCAA] hover:bg-[#f0f0f0]'
                }`}
              >
                Receita (Entrada)
              </button>
              <button
                type="button"
                onClick={() => setTipo('Saída')}
                className={`w-1/2 rounded-xl p-2 text-xs font-bold border transition ${
                  tipo === 'Saída'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#f9f9f9] text-[#9A8060] border-[#FDDCAA] hover:bg-[#f0f0f0]'
                }`}
              >
                Despesa (Saída)
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 block">
              Calculado automaticamente a partir da categoria escolhida.
            </p>
          </div>
        </div>

        {/* Row 3: Descrição, Valor e Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Descrição / Histórico detalhado
            </label>
            <input
              type="text"
              placeholder="Ex: Abastecimento de Diesel S10 250L, Parcela da Rodovia"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] placeholder-[#a8bfa8] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Valor do Repasse (R$) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-bold">R$</span>
              </div>
              <input
                type="text"
                required
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#FDDCAA] rounded-xl pl-9 p-2.5 text-xs font-black font-mono focus:ring-2 focus:ring-[#F5A000] focus:bg-white text-[#1A1A1A] placeholder-[#c2d4c2] transition"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Status and Upload Comprovante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Status da Transação *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Pago', 'Pendente', 'Agendado'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st as TransactionStatus)}
                  className={`rounded-xl p-2.5 text-xs font-bold border transition ${
                    status === st
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                      : 'bg-[#f9f9f9] text-[#5A4828] border-[#FDDCAA] hover:bg-[#f0f0f0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3.5 bg-[#f9f9f9] rounded-xl border border-[#FDDCAA] text-[#5A4828] flex items-start space-x-2.5">
              <BadgeInfo className="h-4 w-4 text-[#F5A000] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Escolha <strong>Pago</strong> se foi liquidado agora, <strong>Pendente</strong> se o faturamento ainda está a caminho, ou <strong>Agendado</strong> se é uma provisão futura (IPVA, faturas mensais Allianz/Itaú).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A4828] uppercase tracking-widest mb-2">
              Anexo / Foto de Comprovante ou CTE
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                dragActive
                  ? 'border-[#F5A000] bg-[#FFF0D4]/50'
                  : comprovante
                  ? 'border-[#F5A000] bg-[#f9f9f9]'
                  : 'border-[#FDDCAA] hover:border-[#F5A000] bg-[#f9f9f9]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
              
              {comprovante ? (
                <div className="flex flex-col items-center">
                  <div className="bg-emerald-100 p-2 rounded-full mb-2">
                    <FileImage className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-emerald-800">
                    Sua foto foi anexada!
                  </p>
                  <p className="text-[10px] text-slate-450 mt-1 truncate max-w-xs font-mono">
                    {comprovanteName || 'comprovante_documento.jpg'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setComprovante(null);
                      setComprovanteName('');
                    }}
                    className="text-[10px] text-red-500 hover:underline mt-2 font-bold"
                  >
                    Remover anexo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 p-2.5 rounded-full mb-2 text-slate-400">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Arraste a foto do cupom/comprovante ou toque para escolher
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Formatos JPG, PNG ou PDF até 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="pt-4 border-t border-[#f0f0f0] flex justify-end space-x-3">
          <button
            type="submit"
            className="bg-[#1A1A1A] hover:bg-[#CC8800] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-sm transition"
          >
            Registrar Lançamento no Fluxo
          </button>
        </div>
      </form>
    </div>
  );
}
