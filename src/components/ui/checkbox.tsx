import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-sm border border-orange shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-5 w-5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {children}
  </label>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
