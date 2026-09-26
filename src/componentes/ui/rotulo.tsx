import * as React from "react";
import { cn } from "@/lib/utilitarios";

export interface PropriedadesRotulo
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  obrigatorio?: boolean;
}

export const Rotulo = React.forwardRef<HTMLLabelElement, PropriedadesRotulo>(
  ({ className, obrigatorio, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-xs font-semibold text-[var(--foreground-muted)] tracking-wide flex items-center gap-1 mb-1.5",
          className
        )}
        {...props}
      >
        {children}
        {obrigatorio && <span className="text-[var(--perigo)]">*</span>}
      </label>
    );
  }
);

Rotulo.displayName = "Rotulo";
