# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for fast builds)
- **Production build**: `npm run build` (uses Turbopack)
- **Start production server**: `npm run start`
- **Linting**: `npm run lint` (ESLint)

## Architecture & Structure

This is a Next.js 15 application with App Router for a Korean university timetable display system. The app is built with React 19 and uses shadcn/ui components with Tailwind CSS.

### Key Components:
- **Schedule Display**: Dual-view system with `DesktopSchedule` and `MobileSchedule` components
- **Data Layer**: Centralized schedule data in `src/data/schedule.ts` with TypeScript interfaces in `src/types/schedule.ts`
- **UI Components**: shadcn/ui components in `src/components/ui/` (Button, Card, Badge, Avatar, Table, Tabs, Separator)
- **Schedule Components**: Custom schedule rendering components in `src/components/schedule/`

### Data Structure:
- Classes are defined with name, room, professor, and optional code
- TimeSlots contain period info and classes for each weekday (mon-fri)
- Professor-specific color coding system for visual organization
- Korean language interface with days/labels in Korean

### Technology Stack:
- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Icons**: Lucide React
- **TypeScript**: Strict mode enabled
- **UI Library**: Radix UI primitives via shadcn/ui

### Path Aliases:
- `@/components` → `src/components`
- `@/lib` → `src/lib` 
- `@/types` → `src/types`
- `@/data` → `src/data`

The application displays a responsive timetable with professor color coding and supports both desktop table view and mobile card-based layout.