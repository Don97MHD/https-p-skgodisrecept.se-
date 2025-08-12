import React from 'react';
import Link from 'next/link';

const Button = ({ href, label, variant = 'primary', size = 'md', additionalClasses = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5';
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-3 text-lg',
    };
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary',
    };
    
    const className = [
        baseClasses,
        sizeClasses[size] || sizeClasses.md,
        variantClasses[variant] || variantClasses.primary,
        additionalClasses
    ].join(' ');

    if (href) {
        return (
            <Link href={href} passHref legacyBehavior>
                <a className={className} {...props}>
                    {label}
                </a>
            </Link>
        );
    }
    
    return (
        <button className={className} {...props}>
            {label}
        </button>
    );
};

export default Button;