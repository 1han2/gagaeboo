'use client';

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Transaction } from '@/lib/types';
import { useMemo, useState } from 'react';
import Link from 'next/link';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

interface StatsChartProps {
    transactions: Transaction[];
    prevTransactions?: Transaction[];
    type: 'expense' | 'income';
}

export default function StatsChart({ transactions, prevTransactions = [], type }: StatsChartProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data, sortedCategories } = useMemo(() => {
        // Current Month Data
        const filtered = transactions.filter(t => t.type === type);
        const byCategory = filtered.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        // Previous Month Data
        const prevFiltered = prevTransactions.filter(t => t.type === type);
        const prevByCategory = prevFiltered.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        // Sort categories by CURRENT month amount desc
        const sorted = Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([label, value]) => ({
                label,
                value,
                prevValue: prevByCategory[label] || 0
            }));

        const labels = sorted.map(i => i.label);
        const values = sorted.map(i => i.value);
        const prevValues = sorted.map(i => i.prevValue);

        // Color palette for categories
        const colorPalette = [
            '#4f46e5', // Indigo
            '#ec4899', // Pink
            '#8b5cf6', // Violet
            '#06b6d4', // Cyan
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#6366f1', // Indigo lighter
            '#14b8a6', // Teal
            '#f97316', // Orange
            '#a855f7', // Purple
            '#84cc16', // Lime
        ];

        const categoryColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);

        return {
            data: {
                labels,
                datasets: [
                    {
                        label: '이번 달',
                        data: values,
                        backgroundColor: categoryColors,
                        borderRadius: 4,
                        barThickness: 12,
                        order: 1
                    },
                    {
                        label: '지난 달',
                        data: prevValues,
                        backgroundColor: '#cbd5e1', // Slate 300
                        borderRadius: 4,
                        barThickness: 12,
                        order: 2
                    }
                ],
            },
            sortedCategories: sorted.map((cat, index) => ({
                ...cat,
                color: categoryColors[index]
            }))
        };
    }, [transactions, prevTransactions, type]);

    if (transactions.length === 0) {
        return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>데이터가 없습니다</div>;
    }

    const getCategoryTransactions = (category: string) => {
        return transactions
            .filter(t => t.type === type && t.category === category)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    return (
        <div style={{ width: '100%', paddingBottom: selectedCategory ? '300px' : '0' }}>
            <div style={{ position: 'relative', height: '250px', width: '100%', marginBottom: '2rem' }}>
                <Bar
                    data={data}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false, // Hide legend for bar chart as x-axis has labels
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `${(context.parsed.y || 0).toLocaleString()}원`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    display: true,
                                    color: '#f1f5f9',
                                },
                                ticks: {
                                    callback: (value) => `${Number(value).toLocaleString()}`,
                                    font: {
                                        size: 10
                                    }
                                },
                                border: {
                                    display: false
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                border: {
                                    display: false
                                }
                            }
                        }
                    }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sortedCategories.map((cat, index) => {
                    const diff = cat.value - cat.prevValue;
                    const isIncrease = diff > 0;
                    const isSelected = selectedCategory === cat.label;

                    return (
                        <button
                            key={cat.label}
                            onClick={() => setSelectedCategory(isSelected ? null : cat.label)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem',
                                backgroundColor: isSelected ? '#e0e7ff' : 'var(--bg-main)',
                                borderRadius: 'var(--radius)',
                                border: 'none',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '2px',
                                    backgroundColor: cat.color
                                }} />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{cat.label}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{cat.value.toLocaleString()}원</span>
                                {cat.prevValue > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: isIncrease ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
                                        {isIncrease ? '▲' : '▼'} {Math.abs(diff).toLocaleString()}원
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedCategory && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40vh',
                    backgroundColor: 'white',
                    borderTopLeftRadius: '1rem',
                    borderTopRightRadius: '1rem',
                    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    borderTop: '1px solid var(--border)',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    <div style={{
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCategory} 상세 내역</h3>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            style={{ padding: '0.5rem', fontSize: '1.5rem', lineHeight: 0.5 }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {getCategoryTransactions(selectedCategory).map(t => (
                            <Link key={t.id} href={`/add?id=${t.id}&date=${t.date}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--bg-main)',
                                    borderRadius: 'var(--radius)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.merchant}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.date}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                        <span style={{ fontWeight: 700 }}>{t.amount.toLocaleString()}원</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.consumer}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {getCategoryTransactions(selectedCategory).length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                내역이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
