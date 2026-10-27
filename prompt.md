# React Component Architecture & Optimization Review

Investigate this project specifically from the perspective of **React component architecture, clarity, maintainability, composition, and rendering performance**.

Focus **strictly on React**.

Do not make the review dependent on the underlying application framework, router, build tool, styling solution, data-fetching library, state-management library, or backend architecture. Treat those technologies as context only where they directly affect the design or behavior of React components.

Use **modern React patterns and current React best practices** appropriate for the React version used by the project.

The goal is **not to refactor everything mechanically**. First understand the existing component architecture, identify meaningful opportunities for improvement, prioritize them, and then implement the highest-value changes.

## What to investigate

### 1. Component size and responsibilities

Identify components that:

- have too many responsibilities;
- are difficult to understand or navigate;
- mix unrelated concerns;
- contain excessive JSX complexity;
- combine rendering, state, event handling, derived values, effects, and other logic in ways that obscure their purpose;
- contain cohesive UI sections that would be clearer as separate components.

Look for opportunities to split large components into smaller, meaningful components.

When extracting components, use **responsibility and conceptual boundaries**, not arbitrary line counts.

Do not create tiny components simply to make files shorter.

### 2. Component composition

Evaluate how components are composed.

Look for opportunities to:

- improve the parent/child structure;
- reduce deeply nested JSX;
- make component responsibilities clearer;
- simplify component APIs;
- replace complicated conditional structures with clearer composition;
- use composition instead of unnecessary abstraction;
- make reusable UI concepts genuinely reusable.

Prefer straightforward React composition over overly generic or highly configurable components.

### 3. Props and data flow

Review component interfaces and prop flow.

Look for:

- unnecessarily large prop lists;
- props that are only forwarded through components;
- duplicated or redundant props;
- derived values being passed when they could be computed locally;
- components receiving more information than they actually need;
- overly generic component APIs;
- awkward parent-to-child communication;
- opportunities to simplify data flow through better component boundaries.

Prefer **small, explicit, intention-revealing props**.

Do not introduce Context or another abstraction merely to avoid passing a few props.

### 4. State management inside React components

Inspect the use of React state.

Look for:

- state that can be derived during rendering;
- duplicated state;
- state that can be removed;
- state that lives at the wrong component level;
- state that could be moved closer to where it is actually used;
- state that is unnecessarily lifted too high;
- synchronization between multiple pieces of state that makes the component harder to reason about.

Prefer the simplest state model that correctly represents the UI.

Do not introduce additional state-management abstractions when normal React state and composition are sufficient.

### 5. Effects

Pay particular attention to `useEffect` and other effect-related logic.

Identify effects that:

- calculate derived values;
- synchronize state unnecessarily;
- duplicate event-handler behavior;
- exist only because the component structure makes simpler logic difficult;
- can be replaced by rendering logic or event handlers;
- create complicated dependency relationships;
- introduce avoidable synchronization between pieces of state.

Prefer **no effect when no external synchronization is required**.

Do not remove legitimate effects merely to reduce their count; distinguish unnecessary effects from effects that correctly synchronize with external systems.

### 6. Hooks

Review React hook usage.

Look for:

- unnecessary custom hooks;
- custom hooks that genuinely improve reuse or clarity;
- custom hooks that merely move code elsewhere without improving the architecture;
- unnecessary `useMemo`;
- unnecessary `useCallback`;
- hooks with unnecessarily complicated dependency arrays;
- opportunities to simplify hook-based logic.

Do not add memoization mechanically.

`useMemo`, `useCallback`, and similar optimizations should be introduced only when they provide a meaningful benefit or support a clearly justified rendering optimization.

Likewise, do not create custom hooks simply because a piece of logic contains hooks.

### 7. Rendering and performance

Look for genuine React rendering issues.

Pay attention to:

- components that re-render more often than necessary;
- unnecessarily large subtrees that update together;
- expensive calculations during rendering;
- unstable references where they actually have a measurable architectural or performance consequence;
- component boundaries that could naturally reduce unnecessary rendering;
- frequently updated UI;
- large lists or repeated UI;
- expensive child components receiving frequently changing props.

Prefer improving **component boundaries and data flow** before introducing memoization.

Do not add `React.memo` indiscriminately.

Performance improvements should be based on a plausible rendering cost, not generic optimization rules.

### 8. Conditional rendering

Review JSX containing:

- deeply nested ternaries;
- complicated boolean expressions;
- repeated conditions;
- large conditional branches;
- conditional structures that make the primary UI hierarchy difficult to understand.

Where appropriate, improve readability using:

- component extraction;
- named derived values;
- early returns;
- clearer composition;
- small, focused rendering functions when appropriate.

The result should make the component's main structure easier to understand at a glance.

### 9. Event handlers

Inspect event-handling logic for:

- overly complicated handlers;
- duplicated behavior;
- handlers performing unrelated responsibilities;
- business or domain logic mixed unnecessarily into presentation code;
- handlers that could be simplified through better component boundaries.

Do not move logic merely to make a component smaller.

Keep logic in the layer where its responsibility is clearest.

### 10. Reusability and duplication

Look for repeated React UI patterns across the project.

Determine whether they represent:

- a real shared component;
- a reusable composition pattern;
- a local pattern that is better left local.

Extract shared components only when there is a **clear shared concept**.

Avoid premature abstraction and "design system" style components that exist only because two pieces of JSX happen to look similar.

### 11. Component naming and readability

Evaluate whether component names and structure clearly communicate intent.

Look for:

- vague names;
- components whose names no longer match their responsibilities;
- components with misleading abstractions;
- excessive indirection;
- JSX that requires excessive mental effort to understand.

Prefer names based on **what the component represents**, not how it happens to be implemented.

## Refactoring principles

Throughout the investigation, prioritize:

1. **Clarity**
2. **Correct component responsibilities**
3. **Simple data flow**
4. **Good composition**
5. **Maintainability**
6. **Actual rendering performance**
7. **Minimal unnecessary abstraction**

Remember:

- A smaller component is not automatically a better component.
- More components are not automatically better.
- Fewer hooks are not automatically better.
- Fewer effects are not automatically better.
- More memoization is not automatically better.
- More reuse is not automatically better.
- More abstraction is not automatically better.

The objective is to produce React code that is **easier to understand and reason about**, while remaining efficient and appropriately modular.

## Keep the review strictly React-focused

Do not turn this into a general application architecture review.

Do not perform unrelated refactoring of:

- routing;
- API design;
- backend code;
- database code;
- build configuration;
- deployment;
- framework-specific architecture;
- package management;
- styling systems;
- testing infrastructure;
- unrelated utilities.

Only investigate those areas when a problem there directly affects the quality, correctness, or performance of the React components being reviewed.

Do not replace existing libraries or architectural approaches simply because you personally prefer another solution.

## Before changing code

First perform a **React component architecture audit**.

Identify the most meaningful opportunities involving:

- component responsibilities;
- component boundaries;
- composition;
- props;
- state;
- effects;
- hooks;
- conditional rendering;
- event handling;
- rendering behavior;
- duplication and reuse;
- readability.

Prioritize the findings by **impact and confidence**.

For significant candidates, determine:

- what is unnecessarily complex;
- why it matters;
- what React-specific improvement would address it;
- whether the improvement is actually worth the added complexity.

Do not refactor code that is already clear and appropriate.

## Implementation

After the audit, implement the **highest-value React improvements**.

Prefer focused refactors that make the component architecture easier to understand.

When modifying components:

- preserve existing behavior;
- preserve UI behavior and interactions;
- preserve accessibility;
- preserve existing business behavior;
- preserve public component APIs unless there is a strong reason to change them;
- avoid introducing unnecessary abstractions;
- avoid changing unrelated code.

When splitting components, make sure each extracted component has a **clear reason to exist**.

When optimizing rendering, make sure the optimization is justified rather than purely theoretical.

## Validation

After the changes:

- run the project's relevant type checks;
- run linting;
- run relevant tests;
- build the project when practical.

Pay particular attention to React-specific regressions such as:

- stale closures;
- incorrect effect dependencies;
- changed state behavior;
- broken event handling;
- unnecessary remounting;
- altered component lifecycle behavior;
- rendering regressions;
- accessibility regressions.

## Final report

Provide a concise final report containing:

### Changes made
Summarize the meaningful React improvements.

### Components split
Explain which components were split and why the new boundaries are better.

### React improvements
Summarize improvements involving composition, state, effects, hooks, props, conditional rendering, or event handling.

### Performance
Explain any meaningful rendering or performance improvements and the reasoning behind them.

### Intentionally unchanged
Mention important areas that were investigated but deliberately left alone because the existing implementation was already appropriate or a refactor would add unnecessary complexity.

The final result should feel like a **thoughtful React refactor**, not a mechanical cleanup.

The primary question throughout the work should be:

> **Does this change make the React code easier to understand, easier to maintain, or meaningfully more efficient without introducing unnecessary complexity?**