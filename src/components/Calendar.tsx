'use client';


import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isSameMonth, setMonth, setYear } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Calendar.module.css';
import { Transaction } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CalendarProps {
    transactions: Transaction[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    isLoading?: boolean;
}

export default function Calendar({ transactions, onDateSelect, selectedDate, currentMonth, onMonthChange, isLoading }: CalendarProps) {
    const router = useRouter();
    const [showPicker, setShowPicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(currentMonth.getMonth());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty cells for start of month
    const startDay = getDay(monthStart); // 0 = Sunday
    const emptyDays = Array(startDay).fill(null);

    const getDayTransactions = (date: Date) => {
        return transactions.filter(t => isSameDay(new Date(t.date), date));
    };

    const getDailyTotal = (date: Date) => {
        const txs = getDayTransactions(date);
        const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expense };
    };

    const handleMonthNav = (direction: 'prev' | 'next') => {
        const newMonth = direction === 'prev'
            ? subMonths(currentMonth, 1)
            : addMonths(currentMonth, 1);

        const startOfNewMonth = startOfMonth(newMonth);
        onMonthChange(startOfNewMonth);

        const today = new Date();
        // Explicitly check if the new month is the current month (Today's month)
        const isCurrentMonth = startOfNewMonth.getMonth() === today.getMonth() &&
            startOfNewMonth.getFullYear() === today.getFullYear();

        if (isCurrentMonth) {
            onDateSelect(today);
        } else {
            onDateSelect(startOfNewMonth);
        }
    };

    const handlePickerOpen = () => {
        setPickerYear(currentMonth.getFullYear());
        setPickerMonth(currentMonth.getMonth());
        setShowPicker(true);
    };

    const handlePickerConfirm = () => {
        const newDate = new Date(pickerYear, pickerMonth, 1);
        const startOfNewMonth = startOfMonth(newDate);
        onMonthChange(startOfNewMonth);

        const today = new Date();
        const isCurrentMonth = startOfNewMonth.getMonth() === today.getMonth() &&
            startOfNewMonth.getFullYear() === today.getFullYear();

        if (isCurrentMonth) {
            onDateSelect(today);
        } else {
            onDateSelect(startOfNewMonth);
        }
        setShowPicker(false);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                <button onClick={() => handleMonthNav('prev')} className={styles.navBtn}>
                    <ChevronLeft size={20} />
                </button>
                <button onClick={handlePickerOpen} className={styles.monthTitle} style={{ fontSize: '1.13rem', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                    {format(currentMonth, 'yyyy년 M월')}
                </button>
                <button onClick={() => handleMonthNav('next')} className={styles.navBtn}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className={styles.grid}>
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}

                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDay} />
                ))}

                {daysInMonth.map(date => {
                    const { income, expense } = getDailyTotal(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => {
                                if (isSameDay(date, selectedDate)) {
                                    router.push(`/add?date=${format(date, 'yyyy-MM-dd')}`);
                                } else {
                                    onDateSelect(date);
                                }
                            }}
                            className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
                            disabled={isLoading}
                        >
                            <span className={styles.dayNumber}>{format(date, 'd')}</span>
                            {!isLoading && (
                                <>
                                    <div className={styles.dots}>
                                        {income > 0 && <div className={`${styles.dot} ${styles.incomeDot}`} />}
                                        {expense > 0 && <div className={`${styles.dot} ${styles.expenseDot}`} />}
                                    </div>
                                    {(income > 0 || expense > 0) && (
                                        <div className={styles.dayTotal}>
                                            {expense > 0 && (
                                                <span className={`${styles.expenseText} ${expense >= 100000 ? styles.highExpense : ''}`}>
                                                    -{expense.toLocaleString()}
                                                </span>
                                            )}
                                            {income > 0 && <span className={styles.incomeText}>+{income.toLocaleString()}</span>}
                                        </div>
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {showPicker && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 999
                        }}
                        onClick={() => setShowPicker(false)}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius)',
                        padding: '1.5rem',
                        zIndex: 1000,
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}>년월 선택</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>년도</label>
                            <select
                                value={pickerYear}
                                onChange={(e) => setPickerYear(Number(e.target.value))}
                                className="input"
                                style={{ width: '100%' }}
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>월</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                {months.map((month, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setPickerMonth(index)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius)',
                                            border: 'none',
                                            backgroundColor: pickerMonth === index ? 'var(--primary)' : 'var(--bg-main)',
                                            color: pickerMonth === index ? 'white' : 'var(--text-main)',
                                            fontWeight: pickerMonth === index ? 600 : 500,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setShowPicker(false)}
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePickerConfirm}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
