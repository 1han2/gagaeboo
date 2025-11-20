import clsx from 'clsx';
import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({ className, style }: SkeletonProps) {
  return <div className={clsx('skeleton', className)} style={style} />;
}

