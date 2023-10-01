'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input, inputVariants } from '~/components/ui/input'
import { NumberInput } from '~/components/ui/number-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Tag } from '../_lib/tag'
import { addTransactionSchema } from '../_lib/zod-schemas'

type FieldValues = z.infer<typeof addTransactionSchema>
export default function AddExpenseForm({
  tags,
  databaseId,
}: {
  tags: Tag[]
  databaseId: string
}) {
  const router = useRouter()
  const form = useForm<FieldValues>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: useDefaultValues(),
  })

  const { mutateAsync } = useMutation({
    mutationFn: async (data: FieldValues) => {
      const res = await fetch('/api/finance/transaction/variable', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add transaction')
    },
  })

  return (
    <form
      onSubmit={form.handleSubmit(async (data) => {
        try {
          await mutateAsync(data)
          form.reset()
          toast.success('Transaction added')
          router.push('/finance')
        } catch (err) {
          toast.error((err as Error).message)
        }
      })}
      className='grid gap-4 p-4'
    >
      <Form {...form}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <NumberInput {...field} inputMode='decimal' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='date'
          render={({ field: { value, ...field } }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatDateForInput(value)}
                  type='date'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tag'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <TagCombobox
                tags={tags}
                tag={field.value}
                onSelect={(tag) => field.onChange(tag)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className='h-4 w-4 animate-spin' />
          )}
          Finish
        </Button>
      </Form>
    </form>
  )
}

function TagCombobox({
  tags,
  onSelect,
  tag,
}: {
  tag?: Tag
  onSelect: (tag: Tag) => unknown
  tags: Tag[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type='button' className={inputVariants()} aria-expanded={open}>
          {tag?.name ?? 'Select a tag...'}
        </button>
      </PopoverTrigger>

      <PopoverContent>
        <Command>
          <CommandInput placeholder='Add Tag...' />
          <CommandList>
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => {
                  setOpen(false)
                  onSelect(tag)
                }}
              >
                {tag.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function useDefaultValues(): Partial<FieldValues> {
  return useMemo(
    () => ({
      date: new Date(),
    }),
    []
  )
}

function formatDateForInput(value: Date): string {
  return format(value, 'yyyy-MM-dd')
}
