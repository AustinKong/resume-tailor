# Frontend - React + TypeScript + Vite

This is a Vite-powered React application with TypeScript, ESLint, and Prettier configured for optimal development experience.

## Features

- ⚡️ **Vite** - Lightning-fast development server and build tool
- ⚛️ **React 19** - Latest React with modern features
- 🔷 **TypeScript** - Type-safe development
- 🎨 **ESLint** - Code quality and consistency
- 💅 **Prettier** - Code formatting
- 🔧 **VSCode Integration** - Auto-format on save and error highlighting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Code Quality

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

Automatically fix ESLint issues:

```bash
npm run lint:fix
```

### Formatting

Check code formatting:

```bash
npm run format:check
```

Auto-format code:

```bash
npm run format
```

## VSCode Setup

This project is configured to work seamlessly with VSCode:

### Recommended Extensions

When you open this project, VSCode will prompt you to install recommended extensions:

- **ESLint** - Real-time linting in the editor
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class suggestions (optional)

### Auto-formatting

The workspace is configured to:
- **Format on save** - Automatically format files when you save
- **Fix ESLint errors on save** - Automatically fix fixable ESLint errors
- **Show ESLint errors** - Display linting errors inline in the editor

### Settings

All VSCode settings are stored in `.vscode/settings.json` and include:
- Prettier as the default formatter
- Format on save enabled
- ESLint auto-fix on save
- TypeScript workspace version

## Configuration Files

- `vite.config.ts` - Vite configuration
- `eslint.config.js` - ESLint configuration (flat config)
- `.prettierrc` - Prettier configuration
- `tsconfig.json` - TypeScript configuration
- `.vscode/settings.json` - VSCode workspace settings
- `.vscode/extensions.json` - Recommended VSCode extensions

## Prettier Configuration

The project uses the following Prettier settings:
- Semi-colons: **enabled**
- Single quotes: **enabled**
- Print width: **100 characters**
- Tab width: **2 spaces**
- Trailing commas: **ES5 compatible**

You can modify these settings in `.prettierrc` to match your team's preferences.

## ESLint Configuration

ESLint is configured with:
- Recommended JavaScript rules
- TypeScript ESLint recommended rules
- React Hooks rules
- React Refresh rules
- Prettier integration (formatting errors shown as ESLint errors)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

