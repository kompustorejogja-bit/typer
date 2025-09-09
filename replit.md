# TypeRace Pro - Real-Time Typing Competition Platform

## Overview

TypeRace Pro is a real-time multiplayer typing competition platform built with a modern full-stack architecture. The application enables users to create and join typing rooms, compete against multiple players simultaneously, and track their performance with live statistics. The platform features Replit-based authentication, real-time game state synchronization, and comprehensive user statistics tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built with React and TypeScript using Vite as the build tool. The application uses a component-based architecture with:

- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Authentication Flow**: Custom hooks for authentication state management with automatic redirects

The frontend follows a page-based structure with shared components for layout, game mechanics, and UI elements. Real-time game features are handled through polling and optimistic updates.

### Backend Architecture
The server is built with Express.js and TypeScript, providing a RESTful API architecture:

- **Framework**: Express.js with custom middleware for request logging and error handling
- **Authentication**: Replit OpenID Connect (OIDC) integration using Passport.js
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and response formatting
- **Validation**: Zod schemas for request validation and type safety

The backend implements a service-oriented pattern with separate modules for authentication, storage operations, and route handling.

### Data Storage Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver
- **Schema Design**: Relational model with users, rooms, game participants, and results tables
- **Migration Strategy**: Drizzle Kit for schema migrations and database management
- **Connection Pooling**: Neon connection pooling for serverless deployment optimization

The database schema supports user profiles, room management, game participation tracking, and historical game results for statistics.

### Real-Time Game System
The application implements real-time game mechanics without WebSockets, using:

- **Game State Management**: Server-side game state tracking with participant progress updates
- **Room System**: Unique room codes for game sessions with configurable difficulty levels
- **Progress Tracking**: Real-time WPM, accuracy, and completion tracking per participant
- **Leaderboard**: Live ranking updates during games based on current performance

### Authentication and Authorization
The system uses Replit's authentication service with session-based user management:

- **Provider**: Replit OIDC with automatic user registration and profile synchronization
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization Middleware**: Custom middleware for protecting authenticated routes
- **User Management**: Automatic user profile creation and statistics tracking

## External Dependencies

### Authentication Services
- **Replit OIDC**: Primary authentication provider using OpenID Connect protocol
- **Passport.js**: Authentication middleware with OpenID Client strategy

### Database and ORM
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript, Vite build tool, and wouter routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and responsive utilities
- **State Management**: TanStack Query for server state with React Hook Form for forms
- **Validation**: Zod for schema validation and TypeScript integration

### Development and Build Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production builds with external package bundling
- **Development Server**: Vite dev server with HMR and Replit integration plugins
- **Database Tools**: Drizzle Kit for migrations and schema management

### Hosting and Deployment
- **Platform**: Designed for Replit deployment with environment variable configuration
- **Static Assets**: Vite-built client served through Express static middleware
- **Development Mode**: Integrated Vite middleware for seamless development experience