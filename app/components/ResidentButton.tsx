'use client';

import { type ButtonHTMLAttributes } from 'react';

/**
 * 住民向け：高齢者でも押しやすい大きなボタン
 * DESIGN_RESIDENT_UX.md に基づく最小 48px タップ領域
 */
type Variant = 'primary' | 'secondary';

export interface ResidentButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** フル幅にする */
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ResidentButton({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ResidentButtonProps) {
  const { type = 'button', ...rest } = props;
  return (
    <button
      type={type}
      className={`resident-tap-target resident-tap-target--${variant} ${
        fullWidth ? 'w-full' : ''
      } ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
