'use client';

import React, { useEffect, useState } from 'react';
import styles from './SuccessAnimation.module.css';

export const ANIMATION_VARIANTS = [
    { emoji: '🙌', message: '잘했어요!', style: 'burst' },
    { emoji: '💸', message: '부자되자!', style: 'rain' },
    { emoji: '👍', message: '나이스!', style: 'bounce' },
    { emoji: '🎉', message: '완벽해요!', style: 'fountain' },
    { emoji: '🔥', message: '불타오르네!', style: 'burst' },
    { emoji: '⭐', message: '슈퍼스타!', style: 'rain' },
    { emoji: '🍀', message: '행운 가득!', style: 'fountain' },
    { emoji: '💪', message: '힘내자!', style: 'bounce' },
    { emoji: '🚀', message: '가보자고!', style: 'burst' },
    { emoji: '💖', message: '사랑해!', style: 'rain' },
    { emoji: '💎', message: '알뜰살뜰!', style: 'fountain' },
    { emoji: '🌈', message: '수고했어요!', style: 'rain' },
] as const;

interface SuccessAnimationProps {
    variantIndex: number;
    onComplete?: () => void;
}

export default function SuccessAnimation({ variantIndex, onComplete }: SuccessAnimationProps) {
    const [visible, setVisible] = useState(true);
    const variant = ANIMATION_VARIANTS[variantIndex] || ANIMATION_VARIANTS[0];

    // Generate random particles for complex animations
    const [particles] = useState(() => Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // 0-100%
        delay: Math.random() * 0.5, // 0-0.5s
        duration: 0.5 + Math.random() * 1, // 0.5-1.5s
        scale: 0.5 + Math.random() * 1, // 0.5-1.5
    })));

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 2500); // Extended duration for complex animations

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                {variant.style === 'bounce' && (
                    <div className={styles.bounceContainer}>
                        <div className={styles.bounceEmoji}>{variant.emoji}</div>
                    </div>
                )}

                {variant.style === 'rain' && (
                    <div className={styles.rainContainer}>
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className={styles.rainEmoji}
                                style={{
                                    left: `${p.left}%`,
                                    animationDelay: `${p.delay}s`,
                                    animationDuration: `${p.duration}s`,
                                    fontSize: `${2 + p.scale}rem`
                                }}
                            >
                                {variant.emoji}
                            </div>
                        ))}
                    </div>
                )}

                {variant.style === 'fountain' && (
                    <div className={styles.fountainContainer}>
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className={styles.fountainEmoji}
                                style={{
                                    left: '50%',
                                    animationDelay: `${p.delay * 0.5}s`,
                                    fontSize: `${2 + p.scale}rem`,
                                    '--random-x': `${(Math.random() - 0.5) * 200}px`
                                } as React.CSSProperties}
                            >
                                {variant.emoji}
                            </div>
                        ))}
                    </div>
                )}

                {variant.style === 'burst' && (
                    <div className={styles.burstContainer}>
                        <div className={styles.bounceEmoji} style={{ fontSize: '6rem', zIndex: 2 }}>{variant.emoji}</div>
                        {particles.slice(0, 12).map((p, i) => (
                            <div
                                key={p.id}
                                className={styles.burstEmoji}
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${i * 30}deg) translateY(-50px)`,
                                    animationDelay: '0.2s',
                                    fontSize: '2rem'
                                }}
                            >
                                {variant.emoji}
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.message}>
                    {variant.message}
                </div>
            </div>
        </div>
    );
}
