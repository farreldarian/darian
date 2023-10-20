'use client'

import { useRouter } from 'next/navigation'
import { ComponentProps, ReactNode } from 'react'
import { isAddress } from 'viem'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '~/components/ui/form'
import { Input, InputProps } from '~/components/ui/input'
import { useZodForm } from '~/hooks/form'
import { Routes } from '~/lib/routes'

export function DoxxingForm({
  children,
  ...rest
}: { children: ReactNode } & ComponentProps<'form'>) {
  const router = useRouter()
  const form = useZodForm({ schema: formSchema })

  const onSubmit = form.handleSubmit((data) => {
    router.push(Routes.doxxing.account(data.address))
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} {...rest}>
        {children}
      </form>
    </Form>
  )
}

const formSchema = z.object({
  address: z.string().refine(isAddress),
})
type FieldValues = z.infer<typeof formSchema>

export function AddressInput(props: InputProps) {
  return (
    <FormField<FieldValues>
      name='address'
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
