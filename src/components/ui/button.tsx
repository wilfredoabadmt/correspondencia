import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
        return (
            <button ref={ref} className={`px-4 py-2 rounded font-medium ${className}`} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';
