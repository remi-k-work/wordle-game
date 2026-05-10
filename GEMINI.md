# Wordle Game (v2) - Project Context

A modern Wordle clone built with **Next.js**, **React 19**, and **Effect**. This version leverages the **Effect Atom** library for state management and **Effect Platform** for side-effect handling (HTTP requests, concurrency).

## Project Overview

-   **Framework:** Next.js 15+ (App Router, Client Components).
-   **State Management:** `@effect-atom/atom-react` for reactive state, derived selectors, and actions.
-   **Logic Layer:** `effect` for functional programming, error handling, and concurrency management.
-   **Styling:** Tailwind CSS 4 and `motion` (Framer Motion) for animations.
-   **Language Support:** Multi-language support (English and Polish) via data files and language-specific atoms.
-   **Architecture:** Decoupled architecture with:
    -   `src/domain`: Pure functional logic, models, and schemas.
    -   `src/atoms`: Reactive state definitions and orchestrating actions.
    -   `src/services`: Effect-based services for data fetching.
    -   `src/ui`: Visual components consuming atoms.

## Building and Running

### Commands

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the production application.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Runs ESLint for code quality checks.
-   `npm run type-check`: Runs TypeScript compiler in `noEmit` mode.
-   `npm run test`: Executes the test suite using Vitest.
-   `npm run seedPl`: Seeds the Polish dictionary (requires `tsx`).
-   `npm run seedEn`: Seeds the English dictionary (requires `tsx`).

## Development Conventions

### State Management (Effect Atom)

-   **Master Atom:** A single `gameStateAtom` in `src/atoms/game.ts` stores the core game state.
-   **Selectors:** Use `Atom.map` (piped) to create granular derived atoms to minimize re-renders.
-   **Actions:** Defined using `Atom.fn` and usually return an `Effect` for side-effect handling.
-   **Runtime Atoms:** Use `Runtime.atom` for atoms that perform asynchronous effects (like fetching data) on mount.

### Domain Logic

-   The domain logic (`src/domain/gameLogic.ts`) should remain pure and decoupled from the state management layer. It should take current state and inputs, and return next states or derivations.
-   Use `HashSet` from `effect` for efficient dictionary lookups.

### UI & Components

-   Use `useAtomValue` to consume atom state in React components.
-   Use `Result.builder` for handling the loading/error/success states of asynchronous atoms.
-   Components are located in `src/ui`, while `src/app` handles routing and page-level orchestration.

### Testing

-   The project uses `vitest` for unit testing.
-   Aim for high coverage of the pure logic in `src/domain`.

### Styling

-   Tailwind CSS 4 is the primary styling tool.
-   Animations should be handled via `motion` (framer-motion).

## Key Files & Directories

-   `src/atoms/game.ts`: The central hub for game state and actions.
-   `src/domain/gameLogic.ts`: Core Wordle logic (guess validation, grid formatting).
-   `src/services/gameData.ts`: HTTP service for fetching solution and keypad data.
-   `src/ui/Main.tsx`: Main game loop UI component.
-   `public/data/`: Contains JSON files for dictionary solutions and keypad layouts.

# Architecture & Implementation Guidelines

This project is heavily centered around the Effect ecosystem and functional TypeScript patterns.

Before writing or modifying code:

1. Review the official Effect LLM reference:
   https://effect.website/llms-small.txt

2. Check the available project skills in:
   `.gemini/skills`