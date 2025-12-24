/**
 * ARCHITECTURE OF INFORMATION
 * 
 * 1. Pool (Entity)
 *    - Represents a liquidity position.
 *    - Contains metadata (pair, status) and calculated metrics (cached or derived).
 * 
 * 2. Transaction (Entity)
 *    - Immutable record of an event within a pool.
 *    - Types: 'DEPOSIT' (Initial/Add), 'FEE' (Rewards), 'WITHDRAW' (Closing).
 *    - Connects to Pool via poolId.
 * 
 * 3. Settings (Local State)
 *    - Theme preference.
 *    - Language preference.
 */

export type Currency = 'USD' | 'ETH' | 'BTC'; // Simplified for demo
export type PoolStatus = 'ACTIVE' | 'CLOSED';
export type TransactionType = 'DEPOSIT' | 'FEE' | 'WITHDRAW';
export type Language = 'en' | 'pt';

export interface Transaction {
  id: string;
  poolId: string;
  type: TransactionType;
  amount: number;
  timestamp: number; // Unix timestamp
  notes?: string;
}

export interface Pool {
  id: string;
  pairName: string; // e.g., "ETH/USDC"
  status: PoolStatus;
  createdAt: number;
  closedAt?: number;
  
  // Computed fields for quick access (would be calculated in backend usually)
  totalInvested: number;
  totalFees: number;
  currentROI: number; // percentage
}

export interface AppState {
  pools: Pool[];
  transactions: Transaction[];
  theme: 'dark' | 'light';
  language: Language;
}

// Color Palette Constants for Charts/UI
export const COLORS = {
  primary: '#3b82f6', // blue-500
  success: '#10b981', // emerald-500
  darkBg: '#020617', // slate-950
  lightBg: '#f8fafc', // slate-50
  darkCard: '#0f172a', // slate-900
  lightCard: '#ffffff', // white
};