'use client';

import { useState, useEffect, useMemo } from 'react';

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || '0000';

const encodePassword = (password: string) => {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return window.btoa(password);
    }
    if (typeof globalThis !== 'undefined' && (globalThis as { Buffer?: { from: (str: string, enc: string) => { toString: (enc: string) => string } } }).Buffer) {
        return (globalThis as { Buffer: { from: (str: string, enc: string) => { toString: (enc: string) => string } } }).Buffer.from(password, 'utf-8').toString('base64');
    }
    return password;
};

export default function PasswordProtection({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const passwordSignature = useMemo(() => encodePassword(APP_PASSWORD), []);

    useEffect(() => {
        // Check for existing cookie
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth_token='));

        if (authCookie) {
            const value = authCookie.substring(authCookie.indexOf('=') + 1);
            if (value === passwordSignature) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsAuthenticated(true);
            } else {
                document.cookie = 'auth_token=; Max-Age=0; path=/';
            }
        }
        setLoading(false);
    }, [passwordSignature]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === APP_PASSWORD) {
            // Set cookie for 1 year
            const oneYear = 365 * 24 * 60 * 60;
            document.cookie = `auth_token=${passwordSignature}; max-age=${oneYear}; path=/`;
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    if (loading) return null;

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-main)',
            padding: '1rem'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>비밀번호 입력</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="input"
                        style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                        autoFocus
                        inputMode="numeric"
                        pattern="[0-9]*"
                    />
                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>비밀번호가 올바르지 않습니다.</p>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        확인
                    </button>
                </form>
            </div>
        </div>
    );
}
