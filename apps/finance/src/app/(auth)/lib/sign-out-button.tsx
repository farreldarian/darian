'use client'

import { Slot, SlotProps } from '@radix-ui/react-slot'
import { signOut } from 'next-auth/react'

export function SignOutButton(props: SlotProps) {
  return <Slot onClick={() => signOut()} {...props} />
}
