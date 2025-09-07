import { createTamagui } from '@tamagui/core'
import { config } from '@tamagui/config'

export const tamaguiConfig = createTamagui(config)

export default tamaguiConfig

export type AppConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}