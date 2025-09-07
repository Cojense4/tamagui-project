'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { TamaguiProvider } from '@tamagui/core'
import { config } from '../tamagui.config'

export function Providers({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    // @ts-ignore
    const tamaguiCSS = config.getCSS()
    return <style dangerouslySetInnerHTML={{ __html: tamaguiCSS }} />
  })

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  )
}