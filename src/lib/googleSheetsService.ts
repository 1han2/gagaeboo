import { google } from 'googleapis';
import { Transaction } from './types';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Environment variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

import { unstable_cache } from 'next/cache';

const getAllTransactions = unstable_cache(
    async (): Promise<Transaction[]> => {
        if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
            console.warn('Google Sheets credentials missing');
            return [];
        }

        try {
            console.log('Fetching all transactions from Google Sheets...');
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Transactions!A2:H',
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                return [];
            }

            // Map rows to Transaction objects
            // Columns: ID, Date, Amount, Category, Merchant, Consumer, Type, Memo
            return rows.map((row) => ({
                id: row[0],
                date: row[1],
                amount: Number(row[2]),
                category: row[3],
                merchant: row[4],
                consumer: row[5],
                type: row[6] as 'income' | 'expense',
                memo: row[7] || '',
            }));
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            return [];
        }
    },
    ['transactions'],
    { tags: ['transactions'], revalidate: 3600 }
);

export const getSheetTransactions = async (month?: string): Promise<Transaction[]> => {
    const transactions = await getAllTransactions();

    if (month) {
        return transactions.filter(t => t.date.startsWith(month));
    }

    return transactions;
};

export const addSheetTransaction = async (transaction: Transaction): Promise<void> => {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets credentials missing');
    }

    try {
        const values = [
            [
                transaction.id,
                transaction.date,
                transaction.amount,
                transaction.category,
                transaction.merchant,
                transaction.consumer,
                transaction.type,
                transaction.memo || ''
            ]
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Transactions!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values,
            },
        });
    } catch (error) {
        console.error('Error adding to Google Sheets:', error);
        throw error;
    }
};

export const updateSheetTransaction = async (transaction: Transaction): Promise<void> => {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets credentials missing');
    }

    try {
        // 1. Find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Transactions!A:A', // Get all IDs
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found');

        const rowIndex = rows.findIndex(row => row[0] === transaction.id);
        if (rowIndex === -1) throw new Error('Transaction not found');

        // 2. Update the row (rowIndex + 1 because Sheets is 1-indexed)
        const range = `Transactions!A${rowIndex + 1}:H${rowIndex + 1}`;
        const values = [
            [
                transaction.id,
                transaction.date,
                transaction.amount,
                transaction.category,
                transaction.merchant,
                transaction.consumer,
                transaction.type,
                transaction.memo || ''
            ]
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

    } catch (error) {
        console.error('Error updating Google Sheet:', error);
        throw error;
    }
};

export const deleteSheetTransaction = async (id: string): Promise<void> => {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets credentials missing');
    }

    try {
        // 1. Find the row index
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Transactions!A:A', // Get all IDs
        });

        const rows = response.data.values;
        if (!rows) throw new Error('No data found');

        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex === -1) throw new Error('Transaction not found');

        // 2. Delete the row
        // We use batchUpdate with deleteDimension to actually remove the row
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: 0, // Assuming the first sheet. If not, we need to fetch sheetId.
                                dimension: 'ROWS',
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    }
                ]
            }
        });

    } catch (error) {
        console.error('Error deleting from Google Sheet:', error);
        throw error;
    }
};
