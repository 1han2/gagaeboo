'use client';

import React, { useEffect, useState } from 'react';
import styles from './SuccessAnimation.module.css';

export type AnimationType = 'highFive' | 'money';

interface SuccessAnimationProps {
    type: AnimationType;
    onComplete: () => void;
}

export default function SuccessAnimation({ type, onComplete }: SuccessAnimationProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete();
        }, 1200); // Animation duration

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                {type === 'highFive' && (
                    <div className={styles.highFiveContainer}>
                        <div className={styles.clapEffect} />
                        <div className={styles.handLeft}>🙌</div>
                        <div className={styles.handRight}>🙌</div>
                    </div>
                )}

                {type === 'money' && (
                    <div className={styles.moneyContainer}>
                        <div className={styles.money}>💸</div>
                        <div className={styles.money}>💰</div>
                        <div className={styles.money}>💵</div>
                        <div className={styles.money}>💸</div>
                        <div className={styles.money}>💰</div>
                    </div>
                )}

                <div className={styles.message}>
                    {type === 'highFive' ? '잘했어요!' : '부자되자!'}
                </div>
            </div>
        </div>
    );
}
