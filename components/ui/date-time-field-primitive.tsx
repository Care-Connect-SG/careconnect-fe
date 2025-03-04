import * as React from "react"
import { useComposedRefs } from "@radix-ui/react-compose-refs"
import { Primitive } from "@radix-ui/react-primitive"

import {
  useTimescape,
  UseTimescapeOptions,
} from "@/hooks/use-timescape"

export type DateTimeFieldContextProps = {
  disabled?: boolean
} & ReturnType<typeof useTimescape>

const DateTimeFieldContext = React.createContext<DateTimeFieldContextProps>({
  getInputProps: () => ({ ref: () => null }),
  getRootProps: () => ({ ref: () => null }),
  options: {},
  disabled: false,
})

export const useDateTimeFieldContext = () =>
  React.useContext(DateTimeFieldContext)

export interface DateTimeFieldProps
  extends UseTimescapeOptions,
    Omit<
      React.ComponentPropsWithoutRef<typeof Primitive.div>,
      "value" | "defaultValue"
    > {
  disabled?: boolean
}

export const DateTimeField = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  DateTimeFieldProps
>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      disabled,
      digits,
      hour12,
      maxDate,
      minDate,
      snapToStep,
      wheelControl,
      wrapAround,
      ...props
    },
    ref
  ) => {
    const timescape = useTimescape({
      value,
      defaultValue,
      onValueChange,
      digits,
      hour12,
      maxDate,
      minDate,
      snapToStep,
      wheelControl,
      wrapAround,
    })

    const { ref: rootRef, ...rootProps } = timescape.getRootProps()

    const composedRefs = useComposedRefs(ref, (node) => rootRef(node)!)

    return (
      <DateTimeFieldContext.Provider value={{ ...timescape, disabled }}>
        <Primitive.div
          ref={composedRefs}
          data-disabled={disabled}
          {...rootProps}
          {...props}
        />
      </DateTimeFieldContext.Provider>
    )
  }
)
DateTimeField.displayName = "DateTimeField"

export const DateTimeFieldSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.span>,
  React.ComponentPropsWithoutRef<typeof Primitive.span>
>((props, ref) => {
  const { disabled } = useDateTimeFieldContext()

  return (
    <Primitive.span
      ref={ref}
      aria-hidden="true"
      data-disabled={disabled}
      {...props}
    />
  )
})
DateTimeFieldSeparator.displayName = "DateTimeFieldSeparator"

export const DateTimeFieldYears = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("years")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldYears.displayName = "DateTimeFieldYears"

export const DateTimeFieldMonths = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("months")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldMonths.displayName = "DateTimeFieldMonths"

export const DateTimeFieldDays = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("days")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldDays.displayName = "DateTimeFieldDays"

export const DateTimeFieldHours = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("hours")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldHours.displayName = "DateTimeFieldHours"

export const DateTimeFieldMinutes = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("minutes")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldMinutes.displayName = "DateTimeFieldMinutes"

export const DateTimeFieldSeconds = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("seconds")

  const composedRefs = useComposedRefs(ref, inputRef)

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldSeconds.displayName = "DateTimeFieldSeconds"

export const DateTimeFieldAmPm = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled, options } = useDateTimeFieldContext()

  const { ref: inputRef, ...inputProps } = getInputProps("am/pm")

  const composedRefs = useComposedRefs(ref, inputRef)

  if (!options?.hour12) {
    return null
  }

  return (
    <Primitive.input
      ref={composedRefs}
      {...inputProps}
      disabled={disabled || disabledProp}
      {...props}
    />
  )
})
DateTimeFieldAmPm.displayName = "DateTimeFieldAmPm"

const Root = DateTimeField
const Separator = DateTimeFieldSeparator
const Days = DateTimeFieldDays
const Months = DateTimeFieldMonths
const Years = DateTimeFieldYears
const Hours = DateTimeFieldHours
const Minutes = DateTimeFieldMinutes
const Seconds = DateTimeFieldSeconds
const AmPm = DateTimeFieldAmPm

export { Root, Separator, Days, Months, Years, Hours, Minutes, Seconds, AmPm }
