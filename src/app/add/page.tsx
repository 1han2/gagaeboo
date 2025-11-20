'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addTransaction, updateTransaction, deleteTransaction, getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import Calendar from '@/components/Calendar';
import { format } from 'date-fns';
import { USER_LABELS } from '@/lib/config';

function AddTransactionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id');
    const dateParam = searchParams.get('date');

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: dateParam || new Date().toISOString().split('T')[0],
        amount: '',
        category: '식비',
        merchant: '',
        consumer: '함께',
        type: 'expense' as 'income' | 'expense',
        memo: ''
    });

    useEffect(() => {
        if (idParam) {
            const loadTransaction = async () => {
                // We need to fetch the transaction details.
                // Since we don't have a direct "getById" API exposed to client easily without fetching all,
                // we will fetch the month's transactions and find it.
                // Ideally, we should have a getTransactionById server action, but for now:
                // We can assume the date is not known, so we might need to search or pass date in query too.
                // If date is passed in query with ID, it helps.
                // If not, we might need to fetch a range or rely on the user coming from a view that has the data.
                // Let's assume we pass date query param even for edit if possible, or we just fetch current month.
                // Actually, let's add getTransactionById to dataService/actions if needed, 
                // but for simplicity, let's try to find it in the current month or the month of the transaction if provided.

                // Better approach: Pass the transaction object via state? No, URL is better for sharing/refresh.
                // Let's implement a simple getTransactionById in actions.ts or just fetch all for the month if we know the date.
                // If we don't know the date, searching might be expensive in Sheets.
                // Let's require 'date' param for edit as well, or at least try to fetch.

                // For now, let's assume we can fetch the transaction. 
                // We will add a getTransaction server action.

                // Wait, I can't easily add getTransaction right now without changing multiple files.
                // Let's use the existing getTransactions and filter. 
                // We'll assume the transaction is within the last few months or we need the date param.

                if (dateParam) {
                    const transactions = await getTransactions(dateParam.substring(0, 7));
                    const found = transactions.find(t => t.id === idParam);
                    if (found) {
                        setFormData({
                            date: found.date,
                            amount: found.amount.toString(),
                            category: found.category,
                            merchant: found.merchant,
                            consumer: found.consumer,
                            type: found.type,
                            memo: found.memo || ''
                        });
                    }
                }
            };
            loadTransaction();
        }
    }, [idParam, dateParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const transactionData: Transaction = {
            id: idParam || crypto.randomUUID(),
            date: formData.date,
            amount: Number(formData.amount),
            category: formData.category,
            merchant: formData.merchant,
            consumer: formData.consumer,
            type: formData.type,
            memo: formData.memo
        };

        if (idParam) {
            await updateTransaction(transactionData);
        } else {
            await addTransaction(transactionData);
        }

        router.back();
        router.refresh();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <main className="container" style={{ paddingBottom: '5rem' }}>
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className={styles.pageTitle}>{idParam ? '내역 수정' : '내역 수정'}</h1>
                <div style={{ width: 24 }} />
            </div>

            <div className="desktop-layout">
                <div className="desktop-left hide-on-mobile">
                    <Calendar
                        transactions={[]}
                        selectedDate={new Date(formData.date)}
                        onDateSelect={(date) => setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                        currentMonth={new Date(formData.date)}
                        onMonthChange={() => { }}
                    />
                </div>
                <div className="desktop-right">
                    <form id="transaction-form" onSubmit={handleSubmit} className="card">
                        <div className={styles.typeToggle}>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${formData.type === 'expense' ? styles.activeExpense : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                            >
                                지출
                            </button>
                            <button
                                type="button"
                                className={`${styles.typeBtn} ${formData.type === 'income' ? styles.activeIncome : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                            >
                                수입
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label className="label">날짜</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className="label">금액</label>
                            <div className={styles.amountInputWrapper}>
                                <span className={styles.currencySymbol}>₩</span>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount ? Number(formData.amount).toLocaleString() : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData(prev => ({ ...prev, amount: value }));
                                    }}
                                    className={`${styles.input} ${styles.amountInput}`}
                                    placeholder="0"
                                    required
                                    inputMode="numeric"
                                />
                            </div>
                        </div>

                        {formData.type === 'expense' && (
                            <div className={styles.formGroup}>
                                <label className="label">카테고리</label>
                                <div className={styles.categoryGrid}>
                                    {[
                                        { name: '식비', icon: '🍚' },
                                        { name: '카페', icon: '☕' },
                                        { name: '외식', icon: '🍽️' },
                                        { name: '교통', icon: '🚌' },
                                        { name: '쇼핑', icon: '🛍️' },
                                        { name: '생활', icon: '🏠' },
                                        { name: '주거/통신', icon: '📱' },
                                        { name: '의료/건강', icon: '💊' },
                                        { name: '미용', icon: '💇' },
                                        { name: '금융', icon: '💰' },
                                        { name: '문화/여가', icon: '🎬' },
                                        { name: '교육/학습', icon: '📚' },
                                        { name: '자녀/육아', icon: '👶' },
                                        { name: '반려동물', icon: '🐾' },
                                        { name: '경조사/선물', icon: '🎁' },
                                        { name: '기타', icon: '🎸' },
                                    ].map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
                                            className={`${styles.categoryBtn} ${formData.category === cat.name ? styles.activeCategory : ''}`}
                                        >
                                            <span className={styles.catIcon}>{cat.icon}</span>
                                            <span className={styles.catName}>{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className="label">{formData.type === 'income' ? '수입처' : '사용처'}</label>
                            <input
                                type="text"
                                name="merchant"
                                value={formData.merchant}
                                onChange={handleChange}
                                className="input"
                                placeholder={formData.type === 'income' ? '예: 월급' : '예: 스타벅스'}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className="label">사용자</label>
                            <select
                                name="consumer"
                                value={formData.consumer}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="함께">함께</option>
                                <option value={USER_LABELS.person1}>{USER_LABELS.person1}</option>
                                <option value={USER_LABELS.person2}>{USER_LABELS.person2}</option>
                            </select>
                        </div>

                        <div className={styles.actionButtons}>
                            {idParam && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (confirm('정말 삭제하시겠습니까?')) {
                                            setLoading(true);
                                            await deleteTransaction(idParam);
                                            router.back();
                                            router.refresh();
                                        }
                                    }}
                                    className={`btn ${styles.deleteBtn}`}
                                    disabled={loading}
                                >
                                    삭제하기
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: idParam ? 2 : 1 }}
                                disabled={loading}
                            >
                                {loading ? '저장 중...' : (idParam ? '수정하기' : '저장하기')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

export default function AddTransactionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddTransactionForm />
        </Suspense>
    );
}
