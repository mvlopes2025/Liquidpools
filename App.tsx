import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Plus, 
  Moon, 
  Sun, 
  Globe, 
  TrendingUp, 
  ArrowLeft,
  DollarSign,
  Droplets,
  Archive,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Pool, Language, Transaction } from './types';
import { TRANSLATIONS, formatCurrency, formatDate } from './constants';
import { StorageService } from './services/storage';
import { Button, Card, Badge } from './components/UI';
import { CreatePoolModal, AddTransactionModal } from './components/Modals';

type View = 'DASHBOARD' | 'HISTORY' | 'POOL_DETAIL';

function App() {
  // Global State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [lang, setLang] = useState<Language>('pt');
  const [pools, setPools] = useState<Pool[]>([]);
  const [view, setView] = useState<View>('DASHBOARD');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isLiquidityModalOpen, setIsLiquidityModalOpen] = useState(false);

  // Derived State
  const t = TRANSLATIONS[lang];
  const activePools = pools.filter(p => p.status === 'ACTIVE');
  const closedPools = pools.filter(p => p.status === 'CLOSED');
  
  const selectedPool = useMemo(() => 
    pools.find(p => p.id === selectedPoolId), 
  [pools, selectedPoolId]);

  const selectedPoolTransactions = useMemo(() => 
    selectedPoolId ? StorageService.getTransactions(selectedPoolId) : [],
  [selectedPoolId, pools]); // Dependency on pools ensures refresh when transaction adds

  // Effects
  useEffect(() => {
    // Initial Load
    setPools(StorageService.getPools());
    
    // Theme Init
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handlers
  const handleCreatePool = (pair: string, amount: number, time: number) => {
    StorageService.createPool(pair, amount, time);
    setPools(StorageService.getPools()); // Refresh
  };

  const handleAddFee = (amount: number, time: number) => {
    if (selectedPoolId) {
      StorageService.addTransaction(selectedPoolId, 'FEE', amount, time);
      setPools(StorageService.getPools());
    }
  };

  const handleAddLiquidity = (amount: number, time: number) => {
    if (selectedPoolId) {
      StorageService.addTransaction(selectedPoolId, 'DEPOSIT', amount, time);
      setPools(StorageService.getPools());
    }
  };

  const handleClosePool = () => {
    if (selectedPoolId && window.confirm(t.closeWarning)) {
      StorageService.closePool(selectedPoolId, Date.now());
      setPools(StorageService.getPools());
      setView('HISTORY');
    }
  };

  const navigateToPool = (id: string) => {
    setSelectedPoolId(id);
    setView('POOL_DETAIL');
  };

  // --- SUB-COMPONENTS (RENDER HELPERS) ---

  const StatCard = ({ title, value, subValue, icon: Icon }: any) => (
    <Card className="flex items-start justify-between relative overflow-hidden group">
      <div className="z-10 relative">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{subValue}</p>}
      </div>
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl pointer-events-none" />
    </Card>
  );

  const PoolsList = ({ items, emptyMessage }: { items: Pool[], emptyMessage: string }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(pool => (
          <Card key={pool.id} onClick={() => navigateToPool(pool.id)} className="hover:border-blue-500/30 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {pool.pairName}
                </h4>
                <p className="text-xs text-slate-500">{formatDate(pool.createdAt, lang)}</p>
              </div>
              <Badge type={pool.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {pool.status === 'ACTIVE' ? t.activePools.split(' ')[1] : t.status}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t.invested}</span>
                <span className="font-medium text-slate-900 dark:text-slate-200">{formatCurrency(pool.totalInvested, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t.fees}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(pool.totalFees, lang)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                 <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(pool.currentROI, 100)}%` }} />
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">ROI</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{pool.currentROI.toFixed(2)}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const DashboardView = () => {
    const totalInvested = activePools.reduce((acc, p) => acc + p.totalInvested, 0);
    const totalEarnings = activePools.reduce((acc, p) => acc + p.totalFees, 0);
    const avgRoi = activePools.length > 0 ? (totalEarnings / totalInvested) * 100 : 0;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title={t.totalValueLocked} 
            value={formatCurrency(totalInvested, lang)} 
            icon={DollarSign} 
          />
          <StatCard 
            title={t.totalEarnings} 
            value={formatCurrency(totalEarnings, lang)} 
            subValue={`+${avgRoi.toFixed(2)}%`}
            icon={TrendingUp} 
          />
          <StatCard 
            title={t.activePools} 
            value={activePools.length} 
            icon={Droplets} 
          />
        </div>

        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.activePools}</h2>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                    <Plus size={16} className="mr-2" />
                    {t.createPool}
                </Button>
            </div>
            <PoolsList items={activePools} emptyMessage={t.noPools} />
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.noHistory.replace('Nenhuma', '').replace('No', 'Closed')}</h2>
      </div>
      <PoolsList items={closedPools} emptyMessage={t.noHistory} />
    </div>
  );

  const PoolDetailView = () => {
    if (!selectedPool) return null;

    // Prepare Chart Data
    // Aggregate fees by date for the chart
    const feeTransactions = selectedPoolTransactions
        .filter(tx => tx.type === 'FEE')
        .sort((a, b) => a.timestamp - b.timestamp);
    
    // Accumulate fees over time
    let runningTotal = 0;
    const chartData = feeTransactions.map(tx => {
        runningTotal += tx.amount;
        return {
            date: new Date(tx.timestamp).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric'}),
            value: runningTotal,
            daily: tx.amount
        };
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('DASHBOARD')} className="!p-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {selectedPool.pairName}
                <Badge type={selectedPool.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {selectedPool.status}
                </Badge>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t.date}: {formatDate(selectedPool.createdAt, lang)}
              </p>
            </div>
          </div>
          
          {selectedPool.status === 'ACTIVE' && (
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="secondary" onClick={() => setIsLiquidityModalOpen(true)} className="flex-1 md:flex-none">
                    <Droplets size={16} className="mr-2" />
                    {t.addLiquidity}
                </Button>
                <Button onClick={() => setIsFeeModalOpen(true)} className="flex-1 md:flex-none">
                    <Plus size={16} className="mr-2" />
                    {t.addFee}
                </Button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
                <p className="text-sm text-slate-500 mb-1">{t.invested}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(selectedPool.totalInvested, lang)}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-slate-500 mb-1">{t.collectedFees}</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedPool.totalFees, lang)}</p>
            </Card>
            <Card className="p-4">
                <p className="text-sm text-slate-500 mb-1">ROI</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedPool.currentROI.toFixed(2)}%</p>
            </Card>
            <Card className="p-4">
                 <p className="text-sm text-slate-500 mb-1">{t.duration}</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Math.ceil((Date.now() - selectedPool.createdAt) / (1000 * 60 * 60 * 24))} {t.days}
                 </p>
            </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2">
                <Card className="h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">{t.performance} (Cumulative Fees)</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#64748b" 
                                    tick={{fontSize: 12}} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    tick={{fontSize: 12}} 
                                    tickFormatter={(val) => `$${val}`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '8px', border: '1px solid #334155' }}
                                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
                                    formatter={(val: number) => [formatCurrency(val, lang), 'Fees']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 border border-dashed border-slate-700 rounded-lg">
                            No chart data available
                        </div>
                    )}
                </Card>
            </div>

            {/* History Feed */}
            <div className="lg:col-span-1">
                <Card className="h-[400px] flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.feeHistory}</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {selectedPoolTransactions.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        tx.type === 'FEE' ? 'bg-emerald-500/20 text-emerald-500' :
                                        tx.type === 'DEPOSIT' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                                    }`}>
                                        {tx.type === 'FEE' ? <DollarSign size={14} /> : 
                                         tx.type === 'DEPOSIT' ? <ArrowUpRight size={14} /> : <Archive size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase">{tx.type}</p>
                                        <p className="text-xs text-slate-400">{formatDate(tx.timestamp, lang)}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-medium ${
                                    tx.type === 'FEE' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                                }`}>
                                    {tx.type === 'FEE' ? '+' : ''}{formatCurrency(tx.amount, lang)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>

        {selectedPool.status === 'ACTIVE' && (
            <div className="flex justify-center pt-8 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleClosePool}>
                    {t.closePool}
                </Button>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LiquidityFlow</span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Desktop Nav */}
              <div className="hidden md:flex gap-1">
                <Button 
                    variant="ghost" 
                    className={view === 'DASHBOARD' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : ''}
                    onClick={() => setView('DASHBOARD')}
                >
                    <LayoutDashboard size={18} className="mr-2" />
                    {t.dashboard}
                </Button>
                <Button 
                    variant="ghost" 
                    className={view === 'HISTORY' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : ''}
                    onClick={() => setView('HISTORY')}
                >
                    <HistoryIcon size={18} className="mr-2" />
                    {t.history}
                </Button>
              </div>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

              {/* Toggles */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Switch Language"
                >
                    <span className="font-bold text-xs">{lang.toUpperCase()}</span>
                </button>
                <button 
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'DASHBOARD' && <DashboardView />}
        {view === 'HISTORY' && <HistoryView />}
        {view === 'POOL_DETAIL' && <PoolDetailView />}
      </main>

      {/* Modals */}
      <CreatePoolModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePool} 
        lang={lang} 
      />
      
      <AddTransactionModal
        title={t.addFee}
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onSubmit={handleAddFee}
        lang={lang}
      />

      <AddTransactionModal
        title={t.addLiquidity}
        isOpen={isLiquidityModalOpen}
        onClose={() => setIsLiquidityModalOpen(false)}
        onSubmit={handleAddLiquidity}
        lang={lang}
      />
    </div>
  );
}

export default App;