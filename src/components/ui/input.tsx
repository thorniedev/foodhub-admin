import * as React from "react";

import { cn } from "@/src/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-9 w-full rounded-lg border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-55",
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
