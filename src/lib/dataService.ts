import { Transaction } from './types';
import { getTransactions as getMockTransactions, addTransaction as addMockTransaction, updateTransaction as updateMockTransaction, deleteTransaction as deleteMockTransaction } from './mockFinanceService';
import { fetchTransactions, createTransaction, updateTransactionAction, deleteTransactionAction } from '@/app/actions';

const USE_SERVER_MODE = process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS === 'true';

export const getTransactions = async (month?: string): Promise<Transaction[]> => {
    if (USE_SERVER_MODE) {
        return await fetchTransactions(month);
    } else {
        return await getMockTransactions(month);
    }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
    if (USE_SERVER_MODE) {
        await createTransaction(transaction);
    } else {
        await addMockTransaction(transaction);
    }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
    if (USE_SERVER_MODE) {
        await updateTransactionAction(transaction);
    } else {
        await updateMockTransaction(transaction);
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    if (USE_SERVER_MODE) {
        await deleteTransactionAction(id);
    } else {
        await deleteMockTransaction(id);
    }
};
