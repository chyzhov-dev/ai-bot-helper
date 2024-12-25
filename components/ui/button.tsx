import { MouseEventHandler, ReactNode } from 'react';

type Props = {
  variant: 'primary' | 'secondary';
  children: ReactNode;
  className?: HTMLElement['className'];
  onClick: MouseEventHandler;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function Button({
  children,
  variant,
  className,
  onClick,
  disabled,
  isLoading,
}: Props) {
  const variantStyles = {
    primary: 'bg-black text-white disabled:bg-gray-400 border-r-2',
    secondary: 'border-black text-black border-2',
  }[variant];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative w-fit px-10 py-4 text-base ${
        variantStyles ?? ''
      } ${className}`}
      type="button"
    >
      {isLoading && (
        <div className="w-4 h-4 flex items-center justify-center absolute left-4 top-1/2 translate-y-[-50%]">
          <div className="loader w-4 h-4 border-t-4 border-b-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin" />
        </div>
      )}
      {children}
    </button>
  );
}

Button.defaultProps = {
  isLoading: false,
  disabled: false,
  className: '',
};
