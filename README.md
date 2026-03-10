# Braine-Traine Monorepo

Welcome to your new monorepo! This setup uses **Turborepo** and **NPM Workspaces** to manage multiple packages efficiently.

## Project Structure
- `packages/ml-forge-app`: Your main React (Vite) application.
- `packages/ui`: Shared UI component library.
- `packages/utils`: Shared TypeScript utility functions.
- `packages/config`: Shared configurations (ESLint, Tailwind, etc.).

## Day-to-Day Workflow

### 1. Starting Development
Run this command from the **root** folder to start all applications in development mode:
```bash
npm run dev
```
Turbo will intelligently run the `dev` script in all packages.

### 2. Adding Dependencies
Always run install commands from the **root**, specifying the workspace:
- **Add to the main app**: `npm install <package-name> -w ml-forge-app`
- **Add to a shared package**: `npm install <package-name> -w @braine-traine/utils`
- **Add a global dev tool**: `npm install <package-name> -D`

### 3. Using Shared Packages
To use a shared package (like `utils`) in your main app:
1. Ensure it's in the app's `package.json` (I've already linked `@braine-traine/utils`).
2. Import it like a normal library:
   ```typescript
   import { formatDate } from '@braine-traine/utils';
   ```

### 4. Building the Project
To build all packages for production:
```bash
npm run build
```
Turbo will cache successful builds, so it only rebuilds what has changed.

## Key Concepts
- **Workspace**: Each folder in `packages/` is a workspace.
- **Turbo**: The orchestrator that makes tasks (build, dev, test) fast via caching.
- **Symlinking**: NPM automatically "links" your local packages so they act like installed libraries.
