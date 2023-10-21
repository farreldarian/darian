import { zodResolver } from '@hookform/resolvers/zod'
import { FieldValues, useForm, type UseFormProps } from 'react-hook-form'
import { z } from 'zod'

export function useZodForm<
  TSchema extends z.Schema,
  TFieldValues extends FieldValues = z.infer<TSchema>,
  TContext = any,
>({
  schema,
  ...options
}: { schema: TSchema } & Omit<
  UseFormProps<TFieldValues, TContext>,
  'resolver'
>) {
  return useForm<TFieldValues, TContext>({
    ...options,
    resolver: zodResolver(schema),
  } as UseFormProps<TFieldValues>)
}
