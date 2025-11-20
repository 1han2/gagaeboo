export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    date: string; // YYYY-MM-DD
    amount: number;
    category: string;
    merchant: string;
    consumer: string;
    type: TransactionType;
    memo?: string;
}

export interface MonthlyStats {
    month: string; // YYYY-MM
    totalIncome: number;
    totalExpense: number;
    byCategory: Record<string, number>;
}
