"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DateFieldDays,
  DateFieldMonths,
  DateFieldSeparator,
  DateFieldYears,
} from "@/components/ui/date-field"
import * as DatePickerPrimitive from "@/components/ui/date-picker-primitive"
import {
  InputBase,
  InputBaseAdornment,
  InputBaseAdornmentButton,
  InputBaseFlexWrapper,
} from "@/components/ui/input-base"

export const DatePicker = DatePickerPrimitive.Root

export const DatePickerAnchor = DatePickerPrimitive.Anchor

const DatePickerInputBase = React.forwardRef<
  React.ElementRef<typeof InputBase>,
  React.ComponentPropsWithoutRef<typeof InputBase>
>(({ children, ...props }, ref) => (
  <DatePickerAnchor asChild>
    <InputBase ref={ref} {...props}>
      <InputBaseFlexWrapper>{children}</InputBaseFlexWrapper>
      <InputBaseAdornment>
        <InputBaseAdornmentButton asChild>
          <DatePickerPrimitive.Clear>
            <span className="sr-only">Clear date</span>
            <X />
          </DatePickerPrimitive.Clear>
        </InputBaseAdornmentButton>
      </InputBaseAdornment>
      <InputBaseAdornment>
        <InputBaseAdornmentButton asChild>
          <DatePickerPrimitive.Trigger>
            <CalendarIcon />
          </DatePickerPrimitive.Trigger>
        </InputBaseAdornmentButton>
      </InputBaseAdornment>
    </InputBase>
  </DatePickerAnchor>
))
DatePickerInputBase.displayName = "DatePickerInputBase"

const DatePickerDateRangeField = React.forwardRef<
  React.ElementRef<typeof DatePickerPrimitive.DateRangeField>,
  React.ComponentPropsWithoutRef<typeof DatePickerPrimitive.DateRangeField>
>(({ disabled: disabledProp, className, ...props }, ref) => {
  const { disabled } = DatePickerPrimitive.useDatePickerContext()

  return (
    <DatePickerPrimitive.DateRangeField
      ref={ref}
      disabled={disabled || disabledProp}
      className={cn("flex gap-1.5", className)}
      {...props}
    >
      <DatePickerPrimitive.DateRangeFieldFrom className="flex items-center">
        <DatePickerPrimitive.DateRangeFieldYears asChild>
          <DateFieldYears />
        </DatePickerPrimitive.DateRangeFieldYears>
        <DatePickerPrimitive.DateRangeFieldSeparator asChild>
          <DateFieldSeparator />
        </DatePickerPrimitive.DateRangeFieldSeparator>
        <DatePickerPrimitive.DateRangeFieldMonths asChild>
          <DateFieldMonths />
        </DatePickerPrimitive.DateRangeFieldMonths>
        <DatePickerPrimitive.DateRangeFieldSeparator asChild>
          <DateFieldSeparator />
        </DatePickerPrimitive.DateRangeFieldSeparator>
        <DatePickerPrimitive.DateRangeFieldDays asChild>
          <DateFieldDays />
        </DatePickerPrimitive.DateRangeFieldDays>
      </DatePickerPrimitive.DateRangeFieldFrom>

      <DatePickerPrimitive.DateRangeFieldSeparator>
        -
      </DatePickerPrimitive.DateRangeFieldSeparator>

      <DatePickerPrimitive.DateRangeFieldTo className="flex items-center">
        <DatePickerPrimitive.DateRangeFieldYears asChild>
          <DateFieldYears />
        </DatePickerPrimitive.DateRangeFieldYears>
        <DatePickerPrimitive.DateRangeFieldSeparator asChild>
          <DateFieldSeparator />
        </DatePickerPrimitive.DateRangeFieldSeparator>
        <DatePickerPrimitive.DateRangeFieldMonths asChild>
          <DateFieldMonths />
        </DatePickerPrimitive.DateRangeFieldMonths>
        <DatePickerPrimitive.DateRangeFieldSeparator asChild>
          <DateFieldSeparator />
        </DatePickerPrimitive.DateRangeFieldSeparator>
        <DatePickerPrimitive.DateRangeFieldDays asChild>
          <DateFieldDays />
        </DatePickerPrimitive.DateRangeFieldDays>
      </DatePickerPrimitive.DateRangeFieldTo>
    </DatePickerPrimitive.DateRangeField>
  )
})
DatePickerDateRangeField.displayName = "DatePickerDateRangeField"

const DatePickerDateField = React.forwardRef<
  React.ElementRef<typeof DatePickerPrimitive.DateField>,
  React.ComponentPropsWithoutRef<typeof DatePickerPrimitive.DateField>
>(({ disabled: disabledProp, className, ...props }, ref) => {
  const { disabled } = DatePickerPrimitive.useDatePickerContext()

  return (
    <DatePickerPrimitive.DateField
      ref={ref}
      disabled={disabled || disabledProp}
      className={cn("flex", className)}
      {...props}
    >
      <DatePickerPrimitive.DateFieldYears asChild>
        <DateFieldYears />
      </DatePickerPrimitive.DateFieldYears>
      <DatePickerPrimitive.DateFieldSeparator asChild>
        <DateFieldSeparator />
      </DatePickerPrimitive.DateFieldSeparator>
      <DatePickerPrimitive.DateFieldMonths asChild>
        <DateFieldMonths />
      </DatePickerPrimitive.DateFieldMonths>
      <DatePickerPrimitive.DateFieldSeparator asChild>
        <DateFieldSeparator />
      </DatePickerPrimitive.DateFieldSeparator>
      <DatePickerPrimitive.DateFieldDays asChild>
        <DateFieldDays />
      </DatePickerPrimitive.DateFieldDays>
    </DatePickerPrimitive.DateField>
  )
})
DatePickerDateField.displayName = "DatePickerDateField"

export const DatePickerInput = React.forwardRef<
  React.ElementRef<
    typeof DatePickerDateField | typeof DatePickerDateRangeField
  >,
  React.ComponentPropsWithoutRef<
    typeof DatePickerDateField | typeof DatePickerDateRangeField
  >
>((props, ref) => {
  const { mode } = DatePickerPrimitive.useDatePickerContext()

  return (
    <DatePickerInputBase>
      {mode === "range" ? (
        <DatePickerDateRangeField
          ref={ref}
          {...(props as React.ComponentPropsWithoutRef<
            typeof DatePickerDateRangeField
          >)}
        />
      ) : (
        <DatePickerDateField
          ref={ref}
          {...(props as React.ComponentPropsWithoutRef<
            typeof DatePickerDateField
          >)}
        />
      )}
    </DatePickerInputBase>
  )
})
DatePickerInput.displayName = "DatePickerInput"

export const DatePickerTrigger = React.forwardRef<
  React.ElementRef<typeof DatePickerPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DatePickerPrimitive.Trigger>
>(({ children, className, ...props }, ref) => (
  <InputBase
    asChild
    className={cn(
      buttonVariants({ variant: "outline" }),
      "cursor-pointer font-normal",
      className
    )}
  >
    <DatePickerPrimitive.Trigger ref={ref} {...props}>
      <InputBaseAdornment>
        <CalendarIcon />
      </InputBaseAdornment>
      <InputBaseFlexWrapper>{children}</InputBaseFlexWrapper>
    </DatePickerPrimitive.Trigger>
  </InputBase>
))
DatePickerTrigger.displayName = "DatePickerTrigger"

export const DatePickerValue = React.forwardRef<
  React.ElementRef<typeof DatePickerPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof DatePickerPrimitive.Value>
>(({ className, ...props }, ref) => (
  <DatePickerPrimitive.Value
    ref={ref}
    className={cn("data-[placeholder]:text-muted-foreground/40", className)}
    {...props}
  />
))
DatePickerValue.displayName = "DatePickerValue"

export const DatePickerContent = React.forwardRef<
  React.ElementRef<typeof DatePickerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DatePickerPrimitive.Content>
>(({ className, align = "start", alignOffset = 4, ...props }, ref) => (
  <DatePickerPrimitive.Portal>
    <DatePickerPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      className={cn(
        "relative z-50 max-h-96 w-auto overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DatePickerPrimitive.Portal>
))
DatePickerContent.displayName = "DatePickerContent"

export const DatePickerCalendar = (
  props: React.ComponentPropsWithoutRef<typeof Calendar>
) => (
  <DatePickerPrimitive.Calendar asChild>
    <Calendar {...props} />
  </DatePickerPrimitive.Calendar>
)
