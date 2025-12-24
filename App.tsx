import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  Plus, 
  Moon, 
  Sun, 
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
  ResponsiveContainer
} from 'recharts';
import { Pool, Language } from './types';
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
  [selectedPoolId, pools]);

  // Effects
  useEffect(() => {
    setPools(StorageService.getPools());
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handlers
  const handleCreatePool = (pair: string, amount: number, time: number) => {
    StorageService.createPool(pair, amount, time);
    setPools(StorageService.getPools());
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

  // --- SUB-COMPONENTS ---

  const StatCard = ({ title, value, subValue, icon: Icon }: any) => (
    <Card className="flex justify-between">
      <div>
        <p className="text-sm font-medium text-muted mb-1">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {subValue && <p className="text-xs text-success mt-1 font-medium">{subValue}</p>}
      </div>
      <div className="icon-box bg-slate-soft">
        <Icon size={20} />
      </div>
    </Card>
  );

  const PoolsList = ({ items, emptyMessage }: { items: Pool[], emptyMessage: string }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
          <div className="icon-box bg-slate-soft" style={{ width: 64, height: 64, marginBottom: 16 }}>
            <Archive size={32} />
          </div>
          <p>{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid grid-pools">
        {items.map(pool => (
          <Card key={pool.id} onClick={() => navigateToPool(pool.id)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-xl text-primary">{pool.pairName}</h4>
                <p className="text-xs text-muted">{formatDate(pool.createdAt, lang)}</p>
              </div>
              <Badge type={pool.status === 'ACTIVE' ? 'success' : 'neutral'}>
                {pool.status === 'ACTIVE' ? t.activePools.split(' ')[1] : t.status}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t.invested}</span>
                <span className="font-medium">{formatCurrency(pool.totalInvested, lang)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t.fees}</span>
                <span className="font-medium text-success">{formatCurrency(pool.totalFees, lang)}</span>
              </div>
              <div className="progress-bg">
                 <div className="progress-fill" style={{ width: `${Math.min(pool.currentROI, 100)}%` }} />
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-muted">ROI</span>
                <span className="font-bold text-success">+{pool.currentROI.toFixed(2)}%</span>
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
      <div className="flex flex-col gap-6 animate-in">
        <div className="grid grid-dashboard">
          <StatCard title={t.totalValueLocked} value={formatCurrency(totalInvested, lang)} icon={DollarSign} />
          <StatCard title={t.totalEarnings} value={formatCurrency(totalEarnings, lang)} subValue={`+${avgRoi.toFixed(2)}%`} icon={TrendingUp} />
          <StatCard title={t.activePools} value={activePools.length} icon={Droplets} />
        </div>

        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t.activePools}</h2>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                    <Plus size={16} style={{marginRight: 8}} />
                    {t.createPool}
                </Button>
            </div>
            <PoolsList items={activePools} emptyMessage={t.noPools} />
        </div>
      </div>
    );
  };

  const HistoryView = () => (
    <div className="animate-in">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t.noHistory.replace('Nenhuma', '').replace('No', 'Closed')}</h2>
      </div>
      <PoolsList items={closedPools} emptyMessage={t.noHistory} />
    </div>
  );

  const PoolDetailView = () => {
    if (!selectedPool) return null;

    const feeTransactions = selectedPoolTransactions
        .filter(tx => tx.type === 'FEE')
        .sort((a, b) => a.timestamp - b.timestamp);
    
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
      <div className="flex flex-col gap-6 animate-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md-row">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('DASHBOARD')} className="!p-2">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {selectedPool.pairName}
                <Badge type={selectedPool.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {selectedPool.status}
                </Badge>
              </h1>
              <p className="text-sm text-muted mt-1">
                {t.date}: {formatDate(selectedPool.createdAt, lang)}
              </p>
            </div>
          </div>
          
          {selectedPool.status === 'ACTIVE' && (
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="secondary" onClick={() => setIsLiquidityModalOpen(true)} className="flex-1 md:flex-none">
                    <Droplets size={16} style={{marginRight: 8}} />
                    {t.addLiquidity}
                </Button>
                <Button onClick={() => setIsFeeModalOpen(true)} className="flex-1 md:flex-none">
                    <Plus size={16} style={{marginRight: 8}} />
                    {t.addFee}
                </Button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-stats">
            <Card>
                <p className="text-sm text-muted mb-1">{t.invested}</p>
                <p className="text-xl font-bold">{formatCurrency(selectedPool.totalInvested, lang)}</p>
            </Card>
            <Card>
                <p className="text-sm text-muted mb-1">{t.collectedFees}</p>
                <p className="text-xl font-bold text-success">{formatCurrency(selectedPool.totalFees, lang)}</p>
            </Card>
            <Card>
                <p className="text-sm text-muted mb-1">ROI</p>
                <p className="text-xl font-bold text-primary">{selectedPool.currentROI.toFixed(2)}%</p>
            </Card>
            <Card>
                 <p className="text-sm text-muted mb-1">{t.duration}</p>
                 <p className="text-xl font-bold">
                    {Math.ceil((Date.now() - selectedPool.createdAt) / (1000 * 60 * 60 * 24))} {t.days}
                 </p>
            </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-charts">
            {/* Main Chart */}
            <div className="lg:col-span-2" style={{gridColumn: 'span 2'}}>
                <Card className="h-full">
                    <h3 className="text-lg font-bold mb-6">{t.performance} (Cumulative Fees)</h3>
                    <div style={{width: '100%', height: 300}}>
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
                        <div className="flex justify-center items-center h-full text-muted" style={{border: '1px dashed var(--border)', borderRadius: 8}}>
                            No chart data available
                        </div>
                    )}
                    </div>
                </Card>
            </div>

            {/* History Feed */}
            <div style={{gridColumn: 'span 1'}}>
                <Card className="h-full">
                    <h3 className="text-lg font-bold mb-4">{t.feeHistory}</h3>
                    <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
                        {selectedPoolTransactions.map((tx) => (
                            <div key={tx.id} className="list-item">
                                <div className="flex items-center">
                                    <div className={`icon-box ${
                                        tx.type === 'FEE' ? 'bg-emerald-soft' :
                                        tx.type === 'DEPOSIT' ? 'bg-blue-soft' : 'bg-slate-soft'
                                    }`}>
                                        {tx.type === 'FEE' ? <DollarSign size={14} /> : 
                                         tx.type === 'DEPOSIT' ? <ArrowUpRight size={14} /> : <Archive size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted uppercase">{tx.type}</p>
                                        <p className="text-xs text-muted">{formatDate(tx.timestamp, lang)}</p>
                                    </div>
                                </div>
                                <span className={`font-medium ${
                                    tx.type === 'FEE' ? 'text-success' : ''
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
            <div className="flex justify-center" style={{paddingTop: 32, borderTop: '1px solid var(--border)'}}>
                <Button variant="danger" onClick={handleClosePool}>
                    {t.closePool}
                </Button>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container flex justify-between w-full">
          <div className="flex items-center cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <div className="logo-box">L</div>
            <span className="text-xl font-bold">LiquidityFlow</span>
          </div>
          
          <div className="flex items-center">
            {/* Desktop Nav */}
            <div className="hidden md-flex gap-2">
              <Button 
                  variant={view === 'DASHBOARD' ? 'secondary' : 'ghost'} 
                  onClick={() => setView('DASHBOARD')}
              >
                  <LayoutDashboard size={18} style={{marginRight: 8}} />
                  {t.dashboard}
              </Button>
              <Button 
                  variant={view === 'HISTORY' ? 'secondary' : 'ghost'} 
                  onClick={() => setView('HISTORY')}
              >
                  <HistoryIcon size={18} style={{marginRight: 8}} />
                  {t.history}
              </Button>
            </div>

            <div className="nav-divider" />

            {/* Toggles */}
            <div className="flex gap-2">
              <button 
                onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')}
                className="btn-icon text-xs font-bold"
                title="Switch Language"
              >
                  {lang.toUpperCase()}
              </button>
              <button 
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                className="btn-icon"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{paddingTop: 32, paddingBottom: 48}}>
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