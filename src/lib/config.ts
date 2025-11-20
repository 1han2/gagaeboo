// User label configuration
export const USER_LABELS = {
    person1: process.env.NEXT_PUBLIC_USER1_LABEL || '남편',
    person2: process.env.NEXT_PUBLIC_USER2_LABEL || '아내',
    together: '함께'
} as const;
