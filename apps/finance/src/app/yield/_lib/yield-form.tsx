'use client'

import { ReactNode } from 'react'
import { Routes } from '~/app/routes'
import AccountForm from '~/lib/components/AccountForm'
import { buttonGroup } from '~/lib/components/ui/button/recipes'
import { cn } from '~/lib/utils'

export function YieldForm(props: { children: ReactNode }) {
  return (
    <AccountForm
      className={cn(buttonGroup(), 'w-full max-w-xs')}
      getDestinationPath={(a) => Routes.yield.account(a)}
    >
      {props.children}
    </AccountForm>
  )
}
