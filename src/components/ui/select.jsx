import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = ({ children, value, onValueChange, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = 'SelectTrigger'

const SelectValue = ({ placeholder, value }) => (
  <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
    {value || placeholder}
  </span>
)

const NativeSelect = React.forwardRef(({ className, children, value, onChange, ...props }, ref) => (
  <select
    ref={ref}
    value={value}
    onChange={onChange}
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
NativeSelect.displayName = 'NativeSelect'

export { Select, SelectTrigger, SelectValue, NativeSelect }
