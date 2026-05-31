/**
 * Centralized Type Definitions for Finance Entities.
 * Following Mandate #2: Explicitly define interfaces for data shapes.
 */

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  category_icon?: string | null;
  type: TransactionType;
  date: string;
  wallet_id?: string | null;
  wallets?: { name: string } | null;
  debt_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  type: TransactionType | "all";
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  paid_amount: number;
  type: "hutang" | "piutang";
  due_date: string;
  is_settled: boolean;
  description?: string | null;
  created_at: string;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export type InvestmentType = "saham" | "reksadana" | "kripto" | "emas" | "deposito" | "lainnya";

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  symbol: string | null;
  type: InvestmentType;
  amount: number;
  total_invested: number;
  current_value: number;
  created_at: string;
}
