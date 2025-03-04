import * as React from "react"

import {
  DateTimeField,
  DateTimeFieldDays,
  DateTimeFieldMonths,
  DateTimeFieldSeparator,
  DateTimeFieldYears,
} from "@/components/ui/date-time-field"

export const DateField = DateTimeField

export const DateFieldSeparator = React.forwardRef<
  React.ElementRef<typeof DateTimeFieldSeparator>,
  React.ComponentPropsWithoutRef<typeof DateTimeFieldSeparator>
>(({ children = "/", ...props }, ref) => (
  <DateTimeFieldSeparator ref={ref} {...props}>
    {children}
  </DateTimeFieldSeparator>
))
DateFieldSeparator.displayName = "DateFieldSeparator"

export const DateFieldYears = DateTimeFieldYears

export const DateFieldMonths = DateTimeFieldMonths

export const DateFieldDays = DateTimeFieldDays
