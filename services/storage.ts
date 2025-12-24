import { Pool, Transaction, TransactionType } from '../types';

const STORAGE_KEYS = {
  POOLS: 'lf_pools',
  TRANSACTIONS: 'lf_transactions',
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const StorageService = {
  getPools: (): Pool[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POOLS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getTransactions: (poolId?: string): Transaction[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: Transaction[] = data ? JSON.parse(data) : [];
      if (poolId) {
        return all.filter(t => t.poolId === poolId).sort((a, b) => b.timestamp - a.timestamp);
      }
      return all;
    } catch {
      return [];
    }
  },

  createPool: (pairName: string, initialInvestment: number, timestamp: number): Pool => {
    const poolId = generateId();
    const newPool: Pool = {
      id: poolId,
      pairName,
      status: 'ACTIVE',
      createdAt: timestamp,
      totalInvested: initialInvestment,
      totalFees: 0,
      currentROI: 0,
    };

    const initialTx: Transaction = {
      id: generateId(),
      poolId,
      type: 'DEPOSIT',
      amount: initialInvestment,
      timestamp,
      notes: 'Initial Investment'
    };

    const pools = StorageService.getPools();
    const transactions = StorageService.getTransactions();

    localStorage.setItem(STORAGE_KEYS.POOLS, JSON.stringify([newPool, ...pools]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...transactions, initialTx]));

    return newPool;
  },

  addTransaction: (poolId: string, type: TransactionType, amount: number, timestamp: number, notes?: string) => {
    const tx: Transaction = {
      id: generateId(),
      poolId,
      type,
      amount,
      timestamp,
      notes
    };

    const transactions = StorageService.getTransactions();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([...transactions, tx]));

    // Update Pool Stats
    const pools = StorageService.getPools();
    const poolIndex = pools.findIndex(p => p.id === poolId);
    if (poolIndex >= 0) {
      const pool = pools[poolIndex];
      if (type === 'DEPOSIT') {
        pool.totalInvested += amount;
      } else if (type === 'FEE') {
        pool.totalFees += amount;
      }
      
      // Recalculate ROI
      if (pool.totalInvested > 0) {
        pool.currentROI = (pool.totalFees / pool.totalInvested) * 100;
      }
      
      pools[poolIndex] = pool;
      localStorage.setItem(STORAGE_KEYS.POOLS, JSON.stringify(pools));
    }
  },

  closePool: (poolId: string, timestamp: number) => {
    const pools = StorageService.getPools();
    const poolIndex = pools.findIndex(p => p.id === poolId);
    if (poolIndex >= 0) {
      pools[poolIndex].status = 'CLOSED';
      pools[poolIndex].closedAt = timestamp;
      localStorage.setItem(STORAGE_KEYS.POOLS, JSON.stringify(pools));
    }
  }
};