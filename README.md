# MovieSwipe - Movie Recommendation App

A modern movie recommendation app built with Next.js 14+, Tamagui v3, and TheMovieDB API. Swipe through movies like a dating app and get personalized recommendations based on your preferences.

## Features

- 🎬 Swipe interface for movie selection
- 🎯 Personalized recommendations based on preferences
- 🎨 Beautiful UI with Tamagui v3 components
- 📱 Responsive design for all devices
- ⚡ Optimized for performance and memory efficiency
- 🔄 Real-time preference learning

## Prerequisites

- Node.js 18+ and npm/yarn
- TMDB API key (get one at [themoviedb.org](https://www.themoviedb.org/settings/api))
- macOS/Linux/Windows with 16GB+ RAM recommended

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-swipe-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your TMDB API key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
movie-swipe-app/
├── app/                    # Next.js App Router
├── components/             # Reusable components
├── lib/                    # Utilities and API clients
├── types/                  # TypeScript definitions
├── public/                 # Static assets
└── config/                 # Configuration files
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Key Technologies

- **Next.js 14+**: React framework with App Router
- **Tamagui v3**: Cross-platform UI components
- **TypeScript**: Type safety and better DX
- **Framer Motion**: Smooth animations
- **SWR**: Data fetching and caching
- **Axios**: HTTP client

### Performance Guidelines

1. Use Server Components by default
2. Implement proper error boundaries
3. Optimize images with Next.js Image
4. Limit memory usage (cache management)
5. Implement lazy loading for heavy components

## API Documentation

The app uses TheMovieDB API v3. Key endpoints:

- `/discover/movie` - Discover movies with filters
- `/movie/{id}` - Get movie details
- `/genre/movie/list` - Get genre list

See the full API documentation at [developers.themoviedb.org](https://developers.themoviedb.org/3)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TheMovieDB for providing the movie data API
- Tamagui team for the excellent UI library
- Next.js team for the amazing framework