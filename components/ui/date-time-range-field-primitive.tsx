import * as React from "react"
import { useComposedRefs } from "@radix-ui/react-compose-refs"
import { Primitive } from "@radix-ui/react-primitive"

import {
  useTimescapeRange,
  UseTimescapeRangeOptions,
} from "@/hooks/use-timescape"

export type DateTimeRangeFieldContextProps = {
  disabled?: boolean
} & ReturnType<typeof useTimescapeRange>

const DateTimeRangeFieldContext =
  React.createContext<DateTimeRangeFieldContextProps>({
    from: {
      getInputProps: () => ({ ref: () => null }),
      options: {},
    },
    to: {
      getInputProps: () => ({ ref: () => null }),
      options: {},
    },
    getRootProps: () => ({ ref: () => null }),
    disabled: false,
  })

export const useDateTimeRangeFieldContext = () =>
  React.useContext(DateTimeRangeFieldContext)

export interface DateTimeRangeFieldProps
  extends UseTimescapeRangeOptions,
    Omit<
      React.ComponentPropsWithoutRef<typeof Primitive.div>,
      "value" | "defaultValue"
    > {
  disabled?: boolean
}

export const DateTimeRangeField = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  DateTimeRangeFieldProps
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
      from,
      to,
      ...props
    },
    ref
  ) => {
    const timescape = useTimescapeRange({
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
      from,
      to,
    })

    const { ref: rootRef, ...rootProps } = timescape.getRootProps()

    const composedRefs = useComposedRefs(ref, (node) => rootRef(node)!)

    return (
      <DateTimeRangeFieldContext.Provider value={{ ...timescape, disabled }}>
        <Primitive.div
          ref={composedRefs}
          data-disabled={disabled}
          {...rootProps}
          {...props}
        />
      </DateTimeRangeFieldContext.Provider>
    )
  }
)
DateTimeRangeField.displayName = "DateTimeRangeField"

export const DateTimeRangeFieldSeparator = React.forwardRef<
  React.ElementRef<typeof Primitive.span>,
  React.ComponentPropsWithoutRef<typeof Primitive.span>
>((props, ref) => {
  const { disabled } = useDateTimeRangeFieldContext()

  return (
    <Primitive.span
      ref={ref}
      aria-hidden="true"
      data-disabled={disabled}
      {...props}
    />
  )
})
DateTimeRangeFieldSeparator.displayName = "DateTimeRangeFieldSeparator"

const DateTimeRangeFieldFromContext = React.createContext(false)

export const DateTimeRangeFieldFrom = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>((props, ref) => (
  <DateTimeRangeFieldFromContext.Provider value={true}>
    <Primitive.div ref={ref} {...props} />
  </DateTimeRangeFieldFromContext.Provider>
))
DateTimeRangeFieldFrom.displayName = "DateTimeRangeFieldFrom"

const DateTimeRangeFieldToContext = React.createContext(false)

export const DateTimeRangeFieldTo = React.forwardRef<
  React.ElementRef<typeof Primitive.div>,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>((props, ref) => (
  <DateTimeRangeFieldToContext.Provider value={true}>
    <Primitive.div ref={ref} {...props} />
  </DateTimeRangeFieldToContext.Provider>
))
DateTimeRangeFieldTo.displayName = "DateTimeRangeFieldTo"

const useDateTimeFieldSegmentContext = () => {
  const isFrom = React.useContext(DateTimeRangeFieldFromContext)
  const isTo = React.useContext(DateTimeRangeFieldToContext)
  const { disabled, from, to } = useDateTimeRangeFieldContext()

  if (!isFrom && !isTo) {
    throw new Error(
      "useDateTimeFieldSegmentContext should be used within <DateTimeRangeFieldFrom> or <DateTimeRangeFieldTo> components"
    )
  }

  return {
    ...(isFrom ? from : to),
    disabled,
  }
}

export const DateTimeRangeFieldYears = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldYears.displayName = "DateTimeRangeFieldYears"

export const DateTimeRangeFieldMonths = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldMonths.displayName = "DateTimeRangeFieldMonths"

export const DateTimeRangeFieldDays = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldDays.displayName = "DateTimeRangeFieldDays"

export const DateTimeRangeFieldHours = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldHours.displayName = "DateTimeRangeFieldHours"

export const DateTimeRangeFieldMinutes = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldMinutes.displayName = "DateTimeRangeFieldMinutes"

export const DateTimeRangeFieldSeconds = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldSeconds.displayName = "DateTimeRangeFieldSeconds"

export const DateTimeRangeFieldAmPm = React.forwardRef<
  React.ElementRef<typeof Primitive.input>,
  React.ComponentPropsWithoutRef<typeof Primitive.input>
>(({ disabled: disabledProp, ...props }, ref) => {
  const { getInputProps, options, disabled } = useDateTimeFieldSegmentContext()

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
DateTimeRangeFieldAmPm.displayName = "DateTimeRangeFieldAmPm"

const Root = DateTimeRangeField
const From = DateTimeRangeFieldFrom
const To = DateTimeRangeFieldTo
const Separator = DateTimeRangeFieldSeparator
const Years = DateTimeRangeFieldYears
const Months = DateTimeRangeFieldMonths
const Days = DateTimeRangeFieldDays
const Hours = DateTimeRangeFieldHours
const Minutes = DateTimeRangeFieldMinutes
const Seconds = DateTimeRangeFieldSeconds
const AmPm = DateTimeRangeFieldAmPm

export {
  Root,
  From,
  To,
  Separator,
  Years,
  Months,
  Days,
  Hours,
  Minutes,
  Seconds,
  AmPm,
}
