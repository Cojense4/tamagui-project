import { Button, H1, Paragraph, Stack, XStack, YStack } from '@tamagui/core'
import { ChevronRight, Film, Heart, Star } from '@tamagui/lucide-icons'
import Link from 'next/link'
import { tmdbClient } from '@/lib/tmdb/client'

export default async function HomePage() {
  // Fetch some popular movies for display
  let featuredMovies = []
  try {
    const response = await tmdbClient.getPopularMovies(1)
    featuredMovies = response.results.slice(0, 3)
  } catch (error) {
    console.error('Failed to fetch featured movies:', error)
  }

  return (
    <Stack f={1} backgroundColor="$background" padding="$4">
      <YStack space="$8" maxWidth={1200} width="100%" marginHorizontal="auto">
        {/* Hero Section */}
        <YStack space="$6" paddingTop="$8" alignItems="center" textAlign="center">
          <H1 size="$10" color="$color">
            Find Your Next Favorite Movie
          </H1>
          <Paragraph size="$6" color="$color" opacity={0.8} maxWidth={600}>
            Swipe through movies like a dating app and get personalized recommendations based on your taste
          </Paragraph>
          
          <XStack space="$4" marginTop="$4">
            <Link href="/swipe" passHref>
              <Button
                size="$5"
                theme="active"
                icon={ChevronRight}
                iconAfter
                pressStyle={{ scale: 0.97 }}
              >
                Start Swiping
              </Button>
            </Link>
            <Link href="/preferences" passHref>
              <Button
                size="$5"
                variant="outlined"
                pressStyle={{ scale: 0.97 }}
              >
                Set Preferences
              </Button>
            </Link>
          </XStack>
        </YStack>

        {/* Features Section */}
        <YStack space="$6" paddingTop="$8">
          <H1 size="$8" textAlign="center" color="$color">
            How It Works
          </H1>
          
          <XStack space="$4" flexWrap="wrap" justifyContent="center">
            <FeatureCard
              icon={<Film size={32} />}
              title="Browse Movies"
              description="Swipe through a curated selection of movies from various genres"
            />
            <FeatureCard
              icon={<Heart size={32} />}
              title="Like or Dislike"
              description="Swipe right to like, left to dislike, or up to skip"
            />
            <FeatureCard
              icon={<Star size={32} />}
              title="Get Recommendations"
              description="Our algorithm learns your preferences and suggests movies you'll love"
            />
          </XStack>
        </YStack>

        {/* Featured Movies Section */}
        {featuredMovies.length > 0 && (
          <YStack space="$6" paddingTop="$8">
            <H1 size="$8" textAlign="center" color="$color">
              Popular Right Now
            </H1>
            
            <XStack space="$4" flexWrap="wrap" justifyContent="center">
              {featuredMovies.map((movie) => (
                <YStack
                  key={movie.id}
                  width={300}
                  space="$2"
                  backgroundColor="$backgroundHover"
                  borderRadius="$4"
                  padding="$3"
                  hoverStyle={{ scale: 1.02 }}
                  pressStyle={{ scale: 0.98 }}
                  animation="lazy"
                >
                  <Paragraph size="$5" fontWeight="600">
                    {movie.title}
                  </Paragraph>
                  <Paragraph size="$3" opacity={0.8} numberOfLines={3}>
                    {movie.overview}
                  </Paragraph>
                  <XStack space="$2" alignItems="center">
                    <Star size={16} color="$yellow10" />
                    <Paragraph size="$3">
                      {movie.vote_average.toFixed(1)}
                    </Paragraph>
                  </XStack>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}
      </YStack>
    </Stack>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <YStack
      width={300}
      space="$3"
      padding="$4"
      backgroundColor="$backgroundHover"
      borderRadius="$4"
      alignItems="center"
      textAlign="center"
      hoverStyle={{ scale: 1.02 }}
      pressStyle={{ scale: 0.98 }}
      animation="lazy"
    >
      <YStack
        width={60}
        height={60}
        backgroundColor="$backgroundPress"
        borderRadius="$3"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </YStack>
      <Paragraph size="$5" fontWeight="600">
        {title}
      </Paragraph>
      <Paragraph size="$3" opacity={0.8}>
        {description}
      </Paragraph>
    </YStack>
  )
}