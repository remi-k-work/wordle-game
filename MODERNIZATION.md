# Modernization Plan: Wordle Game

## Objective
Modernize the Wordle Game application by upgrading the stack to React 19, Vite 8, TypeScript, Tailwind CSS v4, and Effect/Effect Atom. Transition from a feature-based architecture to a domain-driven structure for better scalability and type safety.

## Scope & Impact
- **Language:** JavaScript → TypeScript.
- **State Management:** Redux Toolkit → Effect Atom.
- **Logic:** Imperative/Thunks → Functional Effect-based logic.
- **Styling:** CSS Modules → Tailwind CSS v4.
- **Architecture:** Feature-based → Domain-driven.

## Proposed Solution

### 1. Infrastructure & Environment
- Upgrade React to v19 and Vite to v8 (leveraging the unified Rolldown bundler).
- Initialize TypeScript with strict mode.
- Install Tailwind CSS v4 using the new `@tailwindcss/vite` plugin.
- Install Effect core (`effect`) and Effect Atom (`@effect-atom/atom`, `@effect-atom/atom-react`).

### 2. Domain-Driven Architecture
Reorganize the `src` directory:
- `src/domain/`: Pure domain models, schemas, and game logic (Effect-based).
- `src/services/`: Effect Services (e.g., word list fetching).
- `src/atoms/`: State definitions using Effect Atom.
- `src/ui/`: React components organized by complexity/scope (atoms, molecules, templates).
- `src/assets/`: Static assets.

### 3. State & Logic Refactoring
- **Domain Modeling:** Use `Schema` for words, guesses, and game status. Use `Data.TaggedEnum` for game outcomes.
- **Atoms:** 
    - `languageAtom`: Current language (English/Polish).
    - `gameAtom`: Writable atom for the core game state.
    - `keypadAtom`: Derived atom for letter statuses.
- **Actions:** Implement game loop logic (handling keystrokes, validation) using `Effect.fn` and `Atom.fn`.

### 4. UI Modernization
- **Tailwind v4:** Perform a 1:1 conversion of existing CSS Modules to Tailwind classes.
- **React 19 Integration:** Use `useAtom` and `useAtomValue` hooks. Use `Result.builder` for elegant handling of the initial word fetch.

## Phased Implementation Plan

### Phase 1: Environment Setup
1. Update `package.json` dependencies (Vite 8, React 19, Tailwind v4, Effect).
2. Configure `tsconfig.json` and CSS-based Tailwind v4 configuration.
3. Set up the Effect Atom `RegistryProvider` in `main.tsx`.

### Phase 2: Domain & Services
1. Define domain types in `src/domain/models.ts`.
2. Port `gameLogic.js` to `src/domain/game-logic.ts` using TypeScript and Effect utilities.
3. Create `SolutionsService` to handle `db-en.json` and `db-pl.json` fetching.
4. Add simple unit tests for core game logic to verify correctness and provide a learning reference.

### Phase 3: Atoms & State
1. Implement `languageAtom`.
2. Implement `gameAtom` and its associated `Atom.fn` actions.
3. Create derived `gridAtom` and `keypadStatusAtom`.

### Phase 4: UI Conversion
1. Convert `ControlPanel`, `WordleGrid`, and `Keypad` to Tailwind v4.
2. Migrate components to TypeScript (`.tsx`).
3. Replace Redux hooks (`useSelector`, `useDispatch`) with `useAtomValue` and `useAtom`.

### Phase 5: Cleanup
1. Remove Redux dependencies and CSS Modules.
2. Final type-check and performance audit.

## Verification & Testing
- **Unit Tests:** Verify game logic (guess formatting, winner detection) using Effect's testing utilities.
- **UI Validation:** Ensure 1:1 visual parity with the current implementation.
- **State Integrity:** Confirm language switching correctly triggers new game/word fetch.

## Future Considerations
- **Persistence:** Add `Atom.kvs` to persist game state.
- **Enhanced Logic:** Implement more complex word validation (e.g., checking if a guess is a real word).
- **Animations:** Use Framer Motion or Tailwind transitions for tile flips.
