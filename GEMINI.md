# Wordle Game - Project Documentation

## Project Overview
This project is a React-based clone of the popular Wordle game. It features a bilingual experience (English and Polish) and leverages Redux Toolkit for robust state management. The application is built with Vite for a fast development experience and uses CSS Modules for scoped styling.

### Core Technologies
- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling:** CSS Modules
- **Linting:** ESLint

## Architecture
The project follows a feature-based architecture. Most of the application logic and UI are organized within the `src/features` directory.

### Directory Structure
- `src/app/`: Redux store configuration.
- `src/features/`: Contains feature-specific logic and components:
    - `game/`: Core game logic, state (slice), and grid components.
    - `keypad/`: Virtual keyboard logic and state.
    - `modal/`: Reusable modal system for help, win, and lose states.
    - `controlPanel/`: Settings and game control (language switching, new game).
- `src/components/`: Common/shared UI components (e.g., `LoadingStatus`).
- `src/assets/`: Static assets like icons and images.
- `src/js/`: Utility/helper functions.
- `public/data/`: JSON word lists for different languages (`db-en.json`, `db-pl.json`).

### State Management
The application uses a centralized Redux store located at `src/app/store.js`. Each feature has its own "slice" defining its state and reducers:
- `gameSlice`: Manages the secret word, current guess, turn count, and game status.
- `keypadSlice`: Tracks the status of keys (e.g., used letters and their colors).
- `modalSlice`: Controls the visibility of the modal system.
- `controlPanelSlice`: Handles language settings and UI-specific flags like `showHelp`.

### Key Logic
Core game mechanics are encapsulated in `src/features/game/gameLogic.js`. This includes:
- `isGuessKeyEntryValid`: Validates individual keystrokes.
- `isSubmittedGuessValid`: Validates the full 5-letter guess upon submission.
- `formatGuess`: Determines the color of tiles based on the secret word.
- `deriveWordleGrid`: Calculates the full grid state from the history of guesses.

## Development Workflow

### Key Commands
- **Start Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Run Linter:** `npm run lint`
- **Preview Production Build:** `npm run preview`

### Development Conventions
- **Feature-First Structure:** When adding new functionality, create a new directory in `src/features` or add to an existing one. Keep logic (slices, helper functions) and components together.
- **CSS Modules:** Use `[ComponentName].module.css` for styling components to avoid global namespace collisions.
- **Redux Usage:** Prefer Redux for cross-component state. Use `createSlice` for defining state and `createAsyncThunk` for asynchronous operations like fetching word lists.
- **Internationalization:** Language support is handled by fetching specific JSON files from `public/data/` based on the `language` state in `controlPanelSlice`.

## Assets
- Icons are primarily SVG files located in `src/assets`.
- Logo and Opengraph images are also stored in `src/assets`.
