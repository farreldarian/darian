'use client'

import { useSearchParams } from 'next/navigation'

/**
 * Pass the callbackUrl to the form submission
 */
export function CallbackUrlInput() {
  const params = useSearchParams()
  const url = params.get('callbackUrl') ?? '/'
  if (!url) return null
  return <input type='text' name='callbackUrl' className='hidden' value={url} />
}
