
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
  className?: string
}

export function DatePicker({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  className,
  ...props
}: DatePickerProps) {
  return (
    <Calendar
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      initialFocus={initialFocus}
      className={cn("p-3 pointer-events-auto", className)}
      {...props}
    />
  )
}
