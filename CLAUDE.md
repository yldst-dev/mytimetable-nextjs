# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for fast builds)
- **Production build**: `npm run build` (uses Turbopack)
- **Start production server**: `npm run start`
- **Linting**: `npm run lint` (ESLint)
- **PWA Icon Generation**: `node scripts/generate-icons.js` (for development placeholder icons)

## Architecture & Structure

This is a Next.js 15 PWA (Progressive Web App) for a Korean university timetable display system with smart notification features. The app is built with React 19 and uses shadcn/ui components with Tailwind CSS.

### Key Components:
- **Schedule Display**: Dual-view system with `DesktopSchedule` and `MobileSwipeSchedule` components
- **PWA Features**: Service Worker, Web App Manifest, push notifications
- **Notification System**: Smart class reminders and attendance notifications
- **Data Layer**: Centralized schedule data in `src/data/schedule.ts` with TypeScript interfaces in `src/types/schedule.ts`
- **UI Components**: shadcn/ui components in `src/components/ui/` (Button, Card, Badge, Alert, Dialog, Tabs, Separator)
- **Schedule Components**: Custom schedule rendering components in `src/components/schedule/`
- **PWA Components**: PWA wrapper, notification setup, and dev tools in `src/components/`

### PWA Implementation:
- **Web App Manifest**: `/public/manifest.json` with Korean language support
- **Service Worker**: `/public/sw.js` with caching, push notifications, and background sync
- **Icons**: Complete set of PWA icons for Android/iOS/Windows in `/public/icons/`
- **Notification System**: 
  - Smart scheduling: 10 minutes before class + attendance check at start time
  - Environment-aware: HTTPS-dependent features controlled via environment variables
  - 36 automatic notifications based on current schedule data
  - Developer tools for testing and debugging

### Environment Variables:
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`: Enable/disable push notifications (false=dev, true=prod)
- `NEXT_PUBLIC_APP_ENV`: App environment for dev tools visibility (development/production)
- `NEXT_PUBLIC_PWA_ENABLED`: Enable/disable PWA features (should be true)

### Mobile Experience:
- **Responsive Design**: Desktop table view + mobile swipe navigation
- **Current Day Detection**: Automatically shows today's schedule on mobile
- **Touch Gestures**: Horizontal swipe between weekdays
- **Install Prompt**: "Add to Home Screen" support for Android/iOS

### Data Structure:
- Classes are defined with name, room, professor, and optional code
- TimeSlots contain period info and classes for each weekday (mon-fri)
- Professor-specific color coding system for visual organization
- Korean language interface with days/labels in Korean
- Notification scheduling based on time slots and class data

### Technology Stack:
- **Framework**: Next.js 15 with App Router and Turbopack
- **PWA**: Web App Manifest, Service Worker, Push Notifications API
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Icons**: Lucide React
- **TypeScript**: Strict mode enabled
- **UI Library**: Radix UI primitives via shadcn/ui
- **Notifications**: Web Notification API with environment-based fallbacks

### Path Aliases:
- `@/components` → `src/components`
- `@/lib` → `src/lib` 
- `@/types` → `src/types`
- `@/data` → `src/data`

### Key Libraries:
- **Notification Management**: `src/lib/notifications.ts` - Environment-aware notification utilities
- **Schedule Management**: `src/lib/scheduler.ts` - Automatic notification scheduling system
- **PWA Wrapper**: `src/components/pwa/PWAWrapper.tsx` - Service Worker registration and initialization
- **Dev Tools**: `src/components/dev/DevToolsPanel.tsx` - Development debugging tools (hidden in production)

### Deployment (Vercel):
Set these environment variables for production:
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true`
- `NEXT_PUBLIC_APP_ENV=production` 
- `NEXT_PUBLIC_PWA_ENABLED=true`

The application is a fully-featured PWA that provides smart class notifications, offline capability, and native app-like experience on mobile devices while maintaining the original timetable functionality.