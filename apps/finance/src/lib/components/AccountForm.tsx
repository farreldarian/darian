'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps } from 'react'
import { Address, isAddress } from 'viem'
import { z } from 'zod'
import { useZodForm } from '../hooks/form'
import {
  Form,
  FormControl,
  FormItem,
  FormMessage,
  createFormField,
} from './ui/form'
import { Input, InputProps } from './ui/input'

// #region Account Form
type Props = ComponentProps<'form'> & {
  getDestinationPath: (address: Address) => string
}

export default function AccountForm({
  children,
  getDestinationPath: getDestinationPath,
  ...rest
}: Props) {
  const router = useRouter()
  const form = useZodForm({ schema: formSchema })

  const onSubmit = form.handleSubmit((data) => {
    router.push(getDestinationPath(data.address))
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} {...rest}>
        {children}
      </form>
    </Form>
  )
}
// #endregion

// #region Schema
const formSchema = z.object({
  address: z.string().refine(isAddress),
})
const FormField = createFormField<z.infer<typeof formSchema>>()
// #endregion

// #region Address Input
export function AccountFormInput(props: InputProps) {
  return (
    <FormField
      name='address'
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
// #endregion
