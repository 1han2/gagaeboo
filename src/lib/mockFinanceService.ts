import { Transaction } from './types';

const STORAGE_KEY = 'couple_finance_transactions';

const MOCK_DATA: Transaction[] = [
    {
        id: '1',
        date: new Date().toISOString().split('T')[0],
        amount: 15000,
        category: '식비',
        merchant: '맥도날드',
        consumer: '남편',
        type: 'expense',
    },
    {
        id: '2',
        date: new Date().toISOString().split('T')[0],
        amount: 5000,
        category: '교통',
        merchant: '지하철',
        consumer: '아내',
        type: 'expense',
    },
    {
        id: '3',
        date: '2023-10-01', // Example past date
        amount: 200000,
        category: '쇼핑',
        merchant: '나이키',
        consumer: '남편',
        type: 'expense',
    }
];

export const getTransactions = async (month?: string): Promise<Transaction[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (typeof window === 'undefined') return MOCK_DATA;

    const stored = localStorage.getItem(STORAGE_KEY);
    const transactions: Transaction[] = stored ? JSON.parse(stored) : MOCK_DATA;

    if (!month) return transactions;

    return transactions.filter(t => t.date.startsWith(month));
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
    if (typeof window === 'undefined') return;
    const transactions = await getTransactions();
    transactions.push(transaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
    if (typeof window === 'undefined') return;
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
        transactions[index] = transaction;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    const transactions = await getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
