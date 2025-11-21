'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addTransaction, updateTransaction, deleteTransaction, getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import { ChevronLeft, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import Calendar from '@/components/Calendar';
import { format } from 'date-fns';
import { USER_LABELS } from '@/lib/config';
import { CATEGORIES } from '@/lib/categoryConfig';
import SuccessAnimation, { ANIMATION_VARIANTS } from '@/components/SuccessAnimation';

export default function AddTransactionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddTransactionForm />
        </Suspense>
    );
}

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
    const [showAnimation, setShowAnimation] = useState(false);
    const [animationVariantIndex, setAnimationVariantIndex] = useState(0);
    const [isSaveComplete, setIsSaveComplete] = useState(false);
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);

    useEffect(() => {
        if (idParam) {
            const loadTransaction = async () => {
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

    useEffect(() => {
        if (isSaveComplete && isAnimationComplete) {
            router.replace(`/?date=${formData.date}`, { scroll: false });
            router.refresh();
        }
    }, [isSaveComplete, isAnimationComplete, formData.date, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setIsSaveComplete(false);
        setIsAnimationComplete(false);

        // Trigger animation IMMEDIATELY (only for new transactions)
        if (!idParam) {
            const randomIndex = Math.floor(Math.random() * ANIMATION_VARIANTS.length);
            setAnimationVariantIndex(randomIndex);
            setShowAnimation(true);
        }

        // Defer save to ensure animation starts rendering first
        setTimeout(async () => {
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

            try {
                if (idParam) {
                    await updateTransaction(transactionData);
                    // For edits, redirect immediately as there's no animation
                    router.replace(`/?date=${formData.date}`, { scroll: false });
                    router.refresh();
                } else {
                    await addTransaction(transactionData);
                }
                setIsSaveComplete(true);
            } catch (error) {
                console.error('Error saving transaction:', error);
                alert('저장 중 오류가 발생했습니다.');
                setShowAnimation(false); // Stop animation on error
                setLoading(false);
            }
        }, 100);
    };

    const handleAnimationComplete = () => {
        setIsAnimationComplete(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <main className={`container ${styles.mainContainer}`}>
            {showAnimation && (
                <SuccessAnimation
                    variantIndex={animationVariantIndex}
                    onComplete={handleAnimationComplete}
                />
            )}
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className={styles.pageTitle}>{idParam ? '내역 수정' : '내역 추가'}</h1>
                {idParam ? (
                    <button
                        onClick={async () => {
                            if (confirm('정말 삭제하시겠습니까?')) {
                                setLoading(true);
                                await deleteTransaction(idParam);
                                router.back();
                                router.refresh();
                            }
                        }}
                        className={styles.deleteBtnHeader}
                        disabled={loading}
                    >
                        <Trash2 size={20} />
                    </button>
                ) : (
                    <div style={{ width: 24 }} />
                )}
            </div>

            <div className={`desktop-layout ${styles.desktopLayout}`}>
                <div className={`desktop-left hide-on-mobile ${styles.desktopLeft}`}>
                    <Calendar
                        transactions={[]}
                        selectedDate={new Date(formData.date)}
                        onDateSelect={(date) => setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }))}
                        currentMonth={new Date(formData.date)}
                        onMonthChange={() => { }}
                    />
                </div>
                <div className={`desktop-right ${styles.desktopRightWrapper}`}>
                    <div className={styles.scrollableFormArea}>
                        <form id="transaction-form" onSubmit={handleSubmit} className={`card ${styles.formCard}`}>
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

                            <div className={styles.formRow}>
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
                            </div>

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

                            {formData.type === 'expense' && (
                                <div className={styles.formGroup}>
                                    <label className="label">카테고리</label>
                                    <div className={styles.categoryGrid}>
                                        {CATEGORIES.map((cat) => (
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


                        </form>
                    </div>
                    <div className={styles.floatingButtonContainer}>
                        <button
                            type="submit"
                            form="transaction-form"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            disabled={loading}
                        >
                            {loading ? '저장 중...' : (idParam ? '수정' : '추가')}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}


