import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'cursor-pointer font-semibold rounded transition focus:outline-none',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-4 py-2 text-base',

        // Variantes
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-600 text-white hover:bg-gray-700',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        variant === 'outline' && 'border border-gray-400 text-gray-700 bg-white hover:bg-gray-100',

        className
      )}
      {...props}
    />
  );
}
