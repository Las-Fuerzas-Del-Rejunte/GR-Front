import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`rounded-xl glass glass-hover ${className}`}>
      {children}
    </div>
  );
};

export default Card;
