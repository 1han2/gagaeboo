'use client';

import React, { useEffect, useState } from 'react';
import styles from './SuccessAnimation.module.css';

export const ANIMATION_VARIANTS = [
    { emoji: '🙌', message: '잘했어요!' },
    { emoji: '💸', message: '부자되자!' },
    { emoji: '👍', message: '나이스!' },
    { emoji: '🎉', message: '완벽해요!' },
    { emoji: '🔥', message: '불타오르네!' },
    { emoji: '⭐', message: '슈퍼스타!' },
    { emoji: '🍀', message: '행운 가득!' },
    { emoji: '💪', message: '힘내자!' },
    { emoji: '🚀', message: '가보자고!' },
    { emoji: '💖', message: '사랑해!' },
    { emoji: '💎', message: '알뜰살뜰!' },
    { emoji: '🌈', message: '무지개빛!' },
] as const;

interface SuccessAnimationProps {
    variantIndex: number;
    onComplete: () => void;
}

export default function SuccessAnimation({ variantIndex, onComplete }: SuccessAnimationProps) {
    const [visible, setVisible] = useState(true);
    const variant = ANIMATION_VARIANTS[variantIndex] || ANIMATION_VARIANTS[0];

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
                <div className={styles.bounceContainer}>
                    <div className={styles.bounceEmoji}>{variant.emoji}</div>
                </div>
                <div className={styles.message}>
                    {variant.message}
                </div>
            </div>
        </div>
    );
}
