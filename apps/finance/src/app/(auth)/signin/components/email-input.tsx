'use client'

import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { buttonGroup } from '~/components/ui/button/recipes'
import { Form, FormField, FormItem, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { useZodForm } from '~/hooks/form'
import getErrorMessage from '~/lib/utils/get-error-msg'

export function EmailInput() {
  const form = useZodForm({ schema: formSchema })
  const isLoading = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form
        className={buttonGroup()}
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await signIn('email', { email: data.email, callbackUrl: '/' })
          } catch (err) {
            toast.error(getErrorMessage(err))
          }
        })}
      >
        <FormField
          name='email'
          render={({ field }) => (
            <FormItem>
              <Input
                {...field}
                autoFocus
                type='email'
                placeholder='Enter your email address'
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isLoading}>
          {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          Continue with Email
        </Button>
      </form>
    </Form>
  )
}

const formSchema = z.object({
  email: z.string().email(),
})
