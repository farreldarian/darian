import { InputHTMLAttributes, forwardRef } from 'react'
import { NumericFormat } from 'react-number-format'
import { cn } from '~/lib/utils'
import { inputVariants } from './input'

interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'type' | 'value'
  > {
  defaultValue?: string | number | null
  value?: string | number | null
}

export const NumberInput = forwardRef<typeof NumericFormat, NumberInputProps>(
  ({ className, ...rest }, ref) => (
    <NumericFormat
      {...rest}
      className={cn(inputVariants(), className)}
      getInputRef={ref}
    />
  )
)
NumberInput.displayName = 'NumberInput'
