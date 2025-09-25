import { forwardRef, InputHTMLAttributes } from "react";
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, label, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    {...props}
                    className={clsx(
                        'w-full px-4 py-2 border rounded focus:outline-none focus:ring-2focus:ring-blue-500 transition', error && 'border-red-500',
                        className
                    )}
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
        )
    }
)