'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { TamaguiProvider as TamaguiProviderBase } from '@tamagui/core'
import { config } from '@/tamagui.config'

export function TamaguiProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    // @ts-ignore
    const tamaguiCSS = config.getCSS()
    return <style dangerouslySetInnerHTML={{ __html: tamaguiCSS }} />
  })

  return (
    <TamaguiProviderBase config={config} defaultTheme="dark">
      {children}
    </TamaguiProviderBase>
  )
}