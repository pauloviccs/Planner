import * as React from "react";
import { cn } from "@/lib/utilitarios";

export function Esqueleto({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--raio-md)] bg-[var(--surface-elevada)] border border-[var(--border)]",
        className
      )}
      {...props}
    />
  );
}

export const Skeleton = Esqueleto;
