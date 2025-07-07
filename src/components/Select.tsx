import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full p-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
));
Select.displayName = 'Select';

export default Select; 