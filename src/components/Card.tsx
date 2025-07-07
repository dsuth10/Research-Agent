import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-card text-card-foreground shadow rounded-lg p-6 max-w-2xl mx-auto space-y-4 ${className}`}>
    {children}
  </div>
);

export default Card; 