"use client"

import * as React from "react"
import { composeEventHandlers } from "@radix-ui/primitive"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Primitive } from "@radix-ui/react-primitive"
import type * as Radix from "@radix-ui/react-primitive"
import { Slot } from "@radix-ui/react-slot"
import { useControllableState } from "@radix-ui/react-use-controllable-state"
import { format } from "date-fns"
import {
  DayPicker,
  type Mode as DatePickerMode,
  type DateRange,
  type DayPickerProps as DayPickerPrimitiveProps,
} from "react-day-picker"

import * as DateTimeFieldPrimitive from "@/components/ui/date-time-field-primitive"
import * as DateTimeRangeFieldPrimitive from "@/components/ui/date-time-range-field-primitive"

// TODO: start month / end month sync with calendar and date field

export type DatePickerContextProps = {
  formatStr: string
  month?: Date
  onMonthChange: (month: Date) => void
  disabled?: boolean
} & (
  | Required<
      Pick<
        DatePickerSingleProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
  | Required<
      Pick<
        DatePickerSingleRequiredProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
  | Required<
      Pick<
        DatePickerMultipleProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
  | Required<
      Pick<
        DatePickerMultipleRequiredProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
  | Required<
      Pick<
        DatePickerRangeProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
  | Required<
      Pick<
        DatePickerRangeRequiredProps,
        "mode" | "required" | "value" | "onValueChange"
      >
    >
)

const DatePickerContext = React.createContext<DatePickerContextProps>({
  mode: "single",
  formatStr: "PPP",
  month: undefined,
  onMonthChange: () => {},
  value: null,
  onValueChange: () => {},
  disabled: false,
  required: false,
})

export const useDatePickerContext = () => React.useContext(DatePickerContext)

export interface DatePickerBaseProps
  extends React.ComponentProps<typeof PopoverPrimitive.Root> {
  mode?: DatePickerMode | undefined
  required?: boolean
  formatStr?: string
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  disabled?: boolean
}

export type DatePickerValue<T extends DatePickerMode = "single"> =
  T extends "single"
    ? Date
    : T extends "multiple"
      ? Date[]
      : T extends "range"
        ? DateRange
        : never

export interface DatePickerSingleProps {
  mode: "single"
  required?: false | undefined
  value?: Date | null
  defaultValue?: Date
  onValueChange?: (value: Date | null) => void
}

export interface DatePickerSingleRequiredProps {
  mode: "single"
  required: true
  value?: Date
  defaultValue?: Date
  onValueChange?: (value: Date) => void
}

export interface DatePickerMultipleProps {
  mode: "multiple"
  required?: false | undefined
  value?: Date[] | null
  defaultValue?: Date[]
  onValueChange?: (value: Date[] | null) => void
}

export interface DatePickerMultipleRequiredProps {
  mode: "multiple"
  required: true
  value?: Date[]
  defaultValue?: Date[]
  onValueChange?: (value: Date[]) => void
}

export interface DatePickerRangeProps {
  mode: "range"
  required?: false | undefined
  value?: DateRange | null
  defaultValue?: DateRange
  onValueChange?: (value: DateRange | null) => void
}

export interface DatePickerRangeRequiredProps {
  mode: "range"
  required: true
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (value: DateRange) => void
}

export type DatePickerProps = DatePickerBaseProps &
  (
    | DatePickerSingleProps
    | DatePickerSingleRequiredProps
    | DatePickerMultipleProps
    | DatePickerMultipleRequiredProps
    | DatePickerRangeProps
    | DatePickerRangeRequiredProps
  )

export const DatePicker = <T extends DatePickerMode = "single">({
  mode = "single" as T,
  formatStr = "PPP",
  open,
  onOpenChange,
  defaultOpen,
  modal,
  children,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled,
  required = false,
}: DatePickerProps) => {
  // Use `null` as empty value when in controlled mode.
  const [value, setValue] = useControllableState<DatePickerValue<T>>({
    prop: valueProp as DatePickerValue<T>,
    defaultProp: defaultValue as DatePickerValue<T>,
    onChange: onValueChange as (value: DatePickerValue<T>) => void,
  })
  const [month, setMonth] = useControllableState({
    prop: monthProp,
    defaultProp: defaultMonth,
    onChange: onMonthChange,
  })

  return (
    <DatePickerContext.Provider
      value={
        {
          mode,
          required,
          formatStr,
          month,
          onMonthChange: setMonth,
          value,
          onValueChange: setValue,
          disabled,
        } as DatePickerContextProps
      }
    >
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        defaultOpen={defaultOpen}
        modal={modal}
      >
        {children}
      </PopoverPrimitive.Root>
    </DatePickerContext.Provider>
  )
}

export const DatePickerTrigger = PopoverPrimitive.Trigger

export const DatePickerDateField = React.forwardRef<
  React.ElementRef<typeof DateTimeFieldPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof DateTimeFieldPrimitive.Root>,
    "value" | "onValueChange"
  >
>(({ disabled: disabledProp, ...props }, ref) => {
  const { mode, onMonthChange, value, onValueChange, required, disabled } =
    useDatePickerContext()

  if (mode !== "single") {
    throw new Error(
      '<DatePickerDateField> should only be used when mode is "single"'
    )
  }

  return (
    <DateTimeFieldPrimitive.Root
      ref={ref}
      disabled={disabled || disabledProp}
      value={value}
      onValueChange={(date) => {
        if (date) {
          onValueChange(date)
          onMonthChange(date)
        } else if (!required) {
          onValueChange(null)
        }
      }}
      {...props}
    />
  )
})
DatePickerDateField.displayName = "DatePickerDateField"

export const DatePickerDateFieldSeparator = DateTimeFieldPrimitive.Separator

export const DatePickerDateFieldYears = DateTimeFieldPrimitive.Years

export const DatePickerDateFieldMonths = DateTimeFieldPrimitive.Months

export const DatePickerDateFieldDays = DateTimeFieldPrimitive.Days

export const DatePickerAnchor = PopoverPrimitive.Anchor

export const DatePickerPortal = PopoverPrimitive.Portal

export const DatePickerDateRangeField = React.forwardRef<
  React.ElementRef<typeof DateTimeRangeFieldPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof DateTimeRangeFieldPrimitive.Root>,
    "value" | "onValueChange"
  >
>(({ disabled: disabledProp, ...props }, ref) => {
  const { mode, onMonthChange, value, onValueChange, required, disabled } =
    useDatePickerContext()

  if (mode !== "range") {
    throw new Error(
      '<DatePickerDateRangeField> should only be used when mode is "range"'
    )
  }

  return (
    <DateTimeRangeFieldPrimitive.Root
      ref={ref}
      disabled={disabled || disabledProp}
      value={value}
      onValueChange={(value) => {
        if (value) {
          onValueChange(value)
          if (value.from) {
            onMonthChange(value.from)
          }
        } else if (!required) {
          onValueChange(null)
        }
      }}
      {...props}
    />
  )
})
DatePickerDateRangeField.displayName = "DatePickerDateRangeField"

export const DatePickerDateRangeFieldFrom = DateTimeRangeFieldPrimitive.From

export const DatePickerDateRangeFieldTo = DateTimeRangeFieldPrimitive.To

export const DatePickerDateRangeFieldSeparator =
  DateTimeRangeFieldPrimitive.Separator

export const DatePickerDateRangeFieldYears = DateTimeRangeFieldPrimitive.Years

export const DatePickerDateRangeFieldMonths = DateTimeRangeFieldPrimitive.Months

export const DatePickerDateRangeFieldDays = DateTimeRangeFieldPrimitive.Days

export const DatePickerClear = React.forwardRef<
  React.ElementRef<typeof Primitive.button>,
  React.ComponentPropsWithoutRef<typeof Primitive.button>
>(({ onClick, ...props }, ref) => {
  const { required, value, onValueChange } = useDatePickerContext()

  return (
    <Primitive.button
      ref={ref}
      disabled={required || !value}
      onClick={composeEventHandlers(
        onClick,
        () => !required && onValueChange(null)
      )}
      {...props}
    />
  )
})
DatePickerClear.displayName = "DatePickerClear"

export interface DatePickerValueProps
  extends Radix.PrimitivePropsWithRef<typeof Primitive.span> {
  placeholder?: React.ReactNode
}

export const DatePickerValue = React.forwardRef<
  React.ElementRef<typeof Primitive.span>,
  DatePickerValueProps
>(({ placeholder, children, ...props }, ref) => {
  const { mode, formatStr, value } = useDatePickerContext()

  const isValueEmpty = React.useMemo(() => {
    if (mode === "single") {
      return !value
    }
    if (mode === "multiple") {
      return !value?.length
    }
    return !value?.from
  }, [mode, value])

  const formattedValue = React.useMemo(() => {
    if (!value) {
      return null
    }
    if (mode === "single") {
      return format(value, formatStr)
    }
    if (mode === "multiple") {
      return value.map((v) => format(v, formatStr)).join(", ")
    }
    return `${value.from ? format(value.from, formatStr) : "Select a date"} - ${value.to ? format(value.to, formatStr) : "Select a date"}`
  }, [mode, value, formatStr])

  return (
    <Primitive.span
      ref={ref}
      data-placeholder={isValueEmpty ? true : undefined}
      {...props}
    >
      {isValueEmpty ? placeholder : (children ?? formattedValue)}
    </Primitive.span>
  )
})
DatePickerValue.displayName = "DatePickerValue"

export const DatePickerContent = PopoverPrimitive.Content

export interface DatePickerCalendarProps
  extends Omit<
    DayPickerPrimitiveProps,
    | "mode"
    | "selected"
    | "onSelect"
    | "month"
    | "onMonthChange"
    | "disabled"
    | "required"
  > {
  asChild?: boolean
  children?: React.ReactNode
}

export const DatePickerCalendar = ({
  asChild,
  autoFocus = true,
  ...props
}: DatePickerCalendarProps) => {
  const {
    mode,
    month,
    onMonthChange,
    value,
    onValueChange,
    disabled,
    required,
  } = useDatePickerContext()

  const Comp = asChild ? (Slot as typeof DayPicker) : DayPicker

  return (
    <Comp
      mode={mode}
      {...({
        selected: value === null ? undefined : value,
        required,
      } as React.ComponentProps<typeof Comp>)}
      onSelect={(value: Date | Date[] | DateRange | undefined) => {
        if (!value && !required) {
          onValueChange(null)
        }
        if (mode === "single") {
          onValueChange(value as Date)
        }
        if (mode === "multiple") {
          onValueChange(value as Date[])
        }
        if (mode === "range") {
          onValueChange(value as DateRange)
        }
      }}
      month={month}
      onMonthChange={onMonthChange}
      disabled={disabled}
      autoFocus={autoFocus}
      {...props}
    />
  )
}

const Root = DatePicker
const DateField = DatePickerDateField
const DateFieldSeparator = DatePickerDateFieldSeparator
const DateFieldYears = DatePickerDateFieldYears
const DateFieldMonths = DatePickerDateFieldMonths
const DateFieldDays = DatePickerDateFieldDays
const DateRangeField = DatePickerDateRangeField
const DateRangeFieldFrom = DatePickerDateRangeFieldFrom
const DateRangeFieldTo = DatePickerDateRangeFieldTo
const DateRangeFieldSeparator = DatePickerDateRangeFieldSeparator
const DateRangeFieldYears = DatePickerDateRangeFieldYears
const DateRangeFieldMonths = DatePickerDateRangeFieldMonths
const DateRangeFieldDays = DatePickerDateRangeFieldDays
const Value = DatePickerValue
const Clear = DatePickerClear
const Trigger = DatePickerTrigger
const Anchor = DatePickerAnchor
const Portal = DatePickerPortal
const Content = DatePickerContent
const Calendar = DatePickerCalendar

export {
  Root,
  DateField,
  DateFieldSeparator,
  DateFieldYears,
  DateFieldMonths,
  DateFieldDays,
  DateRangeField,
  DateRangeFieldFrom,
  DateRangeFieldTo,
  DateRangeFieldSeparator,
  DateRangeFieldYears,
  DateRangeFieldMonths,
  DateRangeFieldDays,
  Value,
  Clear,
  Trigger,
  Anchor,
  Portal,
  Content,
  Calendar,
}
