export interface CategoryConfig {
    name: string;
    icon: string;
    color: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    '식비': { name: '식비', icon: '🍚', color: '#4f46e5' }, // Indigo
    '카페': { name: '카페', icon: '☕', color: '#ec4899' }, // Pink
    '외식': { name: '외식', icon: '🍽️', color: '#8b5cf6' }, // Violet
    '교통': { name: '교통', icon: '🚌', color: '#06b6d4' }, // Cyan
    '쇼핑': { name: '쇼핑', icon: '🛍️', color: '#10b981' }, // Emerald
    '생활': { name: '생활', icon: '🏠', color: '#f59e0b' }, // Amber
    '주거/통신': { name: '주거/통신', icon: '📱', color: '#ef4444' }, // Red
    '의료/건강': { name: '의료/건강', icon: '💊', color: '#6366f1' }, // Indigo lighter
    '미용': { name: '미용', icon: '💇', color: '#14b8a6' }, // Teal
    '금융': { name: '금융', icon: '💰', color: '#f97316' }, // Orange
    '문화/여가': { name: '문화/여가', icon: '🎬', color: '#a855f7' }, // Purple
    '교육/학습': { name: '교육/학습', icon: '📚', color: '#84cc16' }, // Lime
    '자녀/육아': { name: '자녀/육아', icon: '👶', color: '#db2777' }, // Pink-600
    '반려동물': { name: '반려동물', icon: '🐾', color: '#059669' }, // Emerald-600
    '경조사/선물': { name: '경조사/선물', icon: '🎁', color: '#d97706' }, // Amber-600
    '기타': { name: '기타', icon: '🎸', color: '#64748b' }, // Slate-500
};

export const CATEGORIES = Object.values(CATEGORY_CONFIG);

export const getCategoryColor = (categoryName: string): string => {
    return CATEGORY_CONFIG[categoryName]?.color || '#94a3b8'; // Default to slate-400 if not found
};

export const getCategoryIcon = (categoryName: string): string => {
    return CATEGORY_CONFIG[categoryName]?.icon || '🏷️';
};
