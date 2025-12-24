import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    history: "History",
    createPool: "Create Pool",
    activePools: "Active Pools",
    totalValueLocked: "Total Value Locked",
    totalEarnings: "Total Earnings",
    avgRoi: "Avg. ROI",
    pair: "Pair",
    invested: "Invested",
    fees: "Fees Collected",
    roi: "ROI",
    status: "Status",
    actions: "Actions",
    back: "Back",
    addFee: "Add Fees",
    addLiquidity: "Add Liquidity",
    closePool: "Close Pool",
    date: "Date",
    amount: "Amount",
    notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    confirmClose: "Confirm Close",
    closeWarning: "Are you sure you want to close this pool? This action cannot be undone.",
    poolDetails: "Pool Details",
    performance: "Performance",
    feeHistory: "Fee History",
    noPools: "No active pools found.",
    noHistory: "No closed pools found.",
    newPool: "New Liquidity Pool",
    initialInvestment: "Initial Investment",
    pairPlaceholder: "e.g. ETH/USDC",
    timestamp: "Timestamp",
    manualTime: "Set Custom Time",
    collectedFees: "Collected Fees",
    netProfit: "Net Profit",
    duration: "Duration",
    days: "days",
  },
  pt: {
    dashboard: "Painel",
    history: "Histórico",
    createPool: "Criar Pool",
    activePools: "Pools Ativas",
    totalValueLocked: "Valor Total Alocado",
    totalEarnings: "Rendimentos Totais",
    avgRoi: "ROI Médio",
    pair: "Par",
    invested: "Investido",
    fees: "Taxas Coletadas",
    roi: "ROI",
    status: "Status",
    actions: "Ações",
    back: "Voltar",
    addFee: "Registrar Taxas",
    addLiquidity: "Adicionar Liquidez",
    closePool: "Fechar Pool",
    date: "Data",
    amount: "Valor",
    notes: "Notas",
    save: "Salvar",
    cancel: "Cancelar",
    confirmClose: "Confirmar Fechamento",
    closeWarning: "Tem certeza que deseja fechar esta pool? Esta ação não pode ser desfeita.",
    poolDetails: "Detalhes da Pool",
    performance: "Performance",
    feeHistory: "Histórico de Taxas",
    noPools: "Nenhuma pool ativa encontrada.",
    noHistory: "Nenhuma pool encerrada encontrada.",
    newPool: "Nova Pool de Liquidez",
    initialInvestment: "Investimento Inicial",
    pairPlaceholder: "ex: ETH/USDC",
    timestamp: "Data/Hora",
    manualTime: "Definir horário manual",
    collectedFees: "Taxas Coletadas",
    netProfit: "Lucro Líquido",
    duration: "Duração",
    days: "dias",
  }
};

export const formatCurrency = (amount: number, locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (timestamp: number, locale: string = 'en-US') => {
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp));
};