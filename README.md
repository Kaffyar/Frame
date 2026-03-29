# Architectural Voyage

Portfolio site for an architecture and urban planning presentation built with Vite, React, TypeScript, Tailwind CSS, and GSAP.

## Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- GSAP ScrollTrigger
- Vitest

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Project Notes

- Frame-by-frame sequence assets live in `public/videos`.
- The main page entry is `src/pages/Index.tsx`.
- UI primitives under `src/components/ui` come from the shadcn-style setup used in the project scaffold.

## Before Pushing To GitHub

- Review and replace the placeholder contact details with your real email, phone number, and social URLs
- Commit the generated `package-lock.json` so GitHub and CI use the same dependency graph
- Run `npm run lint`, `npm test`, and `npm run build` before pushing
