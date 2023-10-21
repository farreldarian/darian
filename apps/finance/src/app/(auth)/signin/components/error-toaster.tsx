'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function ErrorToaster() {
  const params = useSearchParams()
  const toasted = useRef(false)
  useEffect(() => {
    const error = params.get('error')
    if (!error || toasted.current) return

    toasted.current = true
    toast.error(error)
  }, [params])
  return null
}
