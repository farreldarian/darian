'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

const schema = z.object({
  email: z.string().email(),
})

export default function EmailInput() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  const isLoading = form.formState.isLoading

  return (
    <form
      className='grid gap-2'
      onSubmit={form.handleSubmit(async (data) => {
        await signIn('email', { email: data.email })
      })}
    >
      <Input
        {...form.register('email')}
        autoFocus
        type='email'
        placeholder='Enter your email address'
      />
      <Button type='submit' disabled={isLoading}>
        {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
        Continue with Email
      </Button>
    </form>
  )
}
