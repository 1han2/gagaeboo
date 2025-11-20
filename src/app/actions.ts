'use server';

import { Transaction } from '@/lib/types';
import { getTransactions as getMockTransactions, addTransaction as addMockTransaction } from '@/lib/mockFinanceService';
import { getSheetTransactions, addSheetTransaction, updateSheetTransaction, deleteSheetTransaction } from '@/lib/googleSheetsService';
import { revalidatePath } from 'next/cache';

const USE_GOOGLE_SHEETS = process.env.NEXT_PUBLIC_USE_GOOGLE_SHEETS === 'true';

export async function fetchTransactions(month?: string): Promise<Transaction[]> {
    if (USE_GOOGLE_SHEETS) {
        return await getSheetTransactions(month);
    } else {
        // Mock service is client-side logic in the original file, but we need server-side here.
        // Since mockFinanceService uses localStorage, it won't work on the server.
        // We need a server-side mock or just return empty/static data if not using sheets on server.
        // HOWEVER, for the sake of this transition, if we are running locally without sheets, 
        // we might want to keep using the client-side mock in the components OR 
        // implement a simple file-based mock for server.

        // Let's return a static mock for server-side calls if not using sheets,
        // BUT the original mock was using localStorage which is client-only.
        // To properly support "Mock" mode via Server Actions, we should use a JSON file or in-memory array.

        // For now, let's return the static MOCK_DATA from the service file (ignoring localStorage part for server)
        // We need to modify mockFinanceService to export the data or handle server env.

        // Actually, to keep it simple and working as before when not using Sheets:
        // We can't easily share localStorage between server and client.
        // So if USE_GOOGLE_SHEETS is false, we might need to handle it in the Client Component 
        // OR we accept that "Server Action Mock" is just static data.

        return [
            {
                id: '1',
                date: new Date().toISOString().split('T')[0],
                amount: 15000,
                category: '식비',
                merchant: '맥도날드 (Server Mock)',
                consumer: '남편',
                type: 'expense',
            },
            {
                id: '2',
                date: new Date().toISOString().split('T')[0],
                amount: 5000,
                category: '교통',
                merchant: '지하철 (Server Mock)',
                consumer: '아내',
                type: 'expense',
            }
        ];
    }
}

export async function createTransaction(transaction: Transaction): Promise<void> {
    if (USE_GOOGLE_SHEETS) {
        await addSheetTransaction(transaction);
    } else {
        // Server-side mock add (no-op or log)
        console.log('Mock Transaction Added (Server):', transaction);
    }
    revalidatePath('/');
    revalidatePath('/stats');
}

export async function updateTransactionAction(transaction: Transaction): Promise<void> {
    if (USE_GOOGLE_SHEETS) {
        await updateSheetTransaction(transaction);
    } else {
        console.log('Mock Transaction Updated (Server):', transaction);
    }
    revalidatePath('/');
    revalidatePath('/stats');
}

export async function deleteTransactionAction(id: string): Promise<void> {
    if (USE_GOOGLE_SHEETS) {
        await deleteSheetTransaction(id);
    } else {
        console.log('Mock Transaction Deleted (Server):', id);
    }
    revalidatePath('/');
    revalidatePath('/stats');
}
