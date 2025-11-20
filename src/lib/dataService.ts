import { Transaction } from './types';
import { getTransactions as getMockTransactions, addTransaction as addMockTransaction, updateTransaction as updateMockTransaction, deleteTransaction as deleteMockTransaction } from './mockFinanceService';
import { fetchTransactions, createTransaction, updateTransactionAction, deleteTransactionAction } from '@/app/actions';

const USE_SERVER_MODE = process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS === 'true';
const CACHE_TTL_MS = 60 * 1000;
const transactionsCache = new Map<string, { timestamp: number; data: Transaction[] }>();

const getCacheKey = (month?: string) => month ?? 'all';
const isCacheValid = (timestamp: number) => Date.now() - timestamp < CACHE_TTL_MS;
const invalidateCache = () => transactionsCache.clear();

export const getTransactions = async (month?: string): Promise<Transaction[]> => {
    if (USE_SERVER_MODE) {
        const key = getCacheKey(month);
        const cached = transactionsCache.get(key);
        if (cached && isCacheValid(cached.timestamp)) {
            return cached.data;
        }
        const data = await fetchTransactions(month);
        transactionsCache.set(key, { timestamp: Date.now(), data });
        return data;
    } else {
        return await getMockTransactions(month);
    }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
    if (USE_SERVER_MODE) {
        await createTransaction(transaction);
        invalidateCache();
    } else {
        await addMockTransaction(transaction);
    }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
    if (USE_SERVER_MODE) {
        await updateTransactionAction(transaction);
        invalidateCache();
    } else {
        await updateMockTransaction(transaction);
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    if (USE_SERVER_MODE) {
        await deleteTransactionAction(id);
        invalidateCache();
    } else {
        await deleteMockTransaction(id);
    }
};
