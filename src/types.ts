export type TransactionType = 'Entrada' | 'Saída';
export type TransactionStatus = 'Pago' | 'Pendente' | 'Agendado';
export type Category =
  | 'Frete (Entrada)'
  | 'Combustível'
  | 'Manutenção'
  | 'Peças'
  | 'Pneus'
  | 'Impostos'
  | 'Seguros'
  | 'Financiamento'
  | 'Salários/Diárias'
  | 'Outros';

export interface Transaction {
  id: string;
  data: string; // YYYY-MM-DD
  placa: string; // Placa do caminhão
  categoria: Category;
  empresaFavorecido: string;
  descricaoHistorico: string;
  numDocumento?: string;
  tipo: TransactionType;
  valor: number;
  status: TransactionStatus;
  comprovanteUrl?: string; // Base64 or local URL for receipt preview
}

export interface Truck {
  placa: string;
  modelo: string;
  motorista: string;
  statusDocumento: 'Regular' | 'Vencendo' | 'Vencido';
  dataVencimentoIPVA: string;
  dataVencimentoSeguro: string;
  proximaManutencaoKm: number;
  kmAtual: number;
}

export interface RecurringRule {
  id: string;
  descricao: string;
  empresaFavorecido: string;
  categoria: Category;
  valor: number;
  diaVencimento: number;
}

export interface MaintenanceAlert {
  id: string;
  placa: string;
  tipo: 'IPVA' | 'Seguro' | 'Manutenção' | 'Outros';
  descricao: string;
  status: 'critical' | 'warning' | 'normal';
  dataLimite?: string;
}
