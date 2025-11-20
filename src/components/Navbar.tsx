'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, PieChart } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
                <Calendar size={24} />
                <span className={styles.label}>달력</span>
            </Link>


            <Link href="/stats" className={`${styles.link} ${pathname === '/stats' ? styles.active : ''}`}>
                <PieChart size={24} />
                <span className={styles.label}>통계</span>
            </Link>
        </nav>
    );
}
