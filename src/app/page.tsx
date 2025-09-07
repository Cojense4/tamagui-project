import { YStack, H1, Paragraph, Button } from '@tamagui/core'

export default function Home() {
  return (
    <YStack
      f={1}
      jc="center"
      ai="center"
      gap="$4"
      bg="$background"
      p="$4"
      minHeight="100vh"
    >
      <H1 size="$10" ta="center">
        Welcome to Next.js + Tamagui
      </H1>
      
      <Paragraph size="$6" ta="center" col="$gray10">
        Your modern React app is ready to go!
      </Paragraph>
      
      <YStack gap="$3">
        <Button size="$4" theme="active">
          Get Started
        </Button>
        <Button size="$4" variant="outlined">
          Learn More
        </Button>
      </YStack>
      
      <Paragraph size="$3" ta="center" mt="$8" col="$gray8">
        Edit src/app/page.tsx to get started
      </Paragraph>
    </YStack>
  )
}
