import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full p-3 border border-border rounded-lg bg-input text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export default Textarea; 