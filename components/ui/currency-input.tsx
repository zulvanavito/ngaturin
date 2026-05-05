"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: CurrencyInputProps) {
  // Format numeric value to Indonesian currency format (without Rp)
  const formatValue = (val: number) => {
    if (val === 0) return "";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  const [displayValue, setDisplayValue] = React.useState(formatValue(value));

  // Sync internal state with prop value
  React.useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue === "" ? 0 : parseInt(rawValue, 10);
    
    // Update parent
    onChange(numericValue);
    
    // Update local display with formatting
    setDisplayValue(formatValue(numericValue));
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground pointer-events-none">
        Rp
      </div>
      <Input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={cn("pl-11 font-semibold", className)}
        placeholder="0"
      />
    </div>
  );
}
