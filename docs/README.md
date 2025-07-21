# Fjell Registry Documentation Site

This is a React-based documentation site for the Fjell Registry package. It provides an interactive and modern way to view the project documentation with syntax highlighting and responsive design.

## Features

- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, modern interface with Fjell branding
- 🔍 **Syntax Highlighting** - Code blocks with proper syntax highlighting
- 📖 **Markdown Support** - Full GitHub Flavored Markdown support
- 🚀 **Fast Loading** - Built with Vite for optimal performance

## Development

### Prerequisites

- Node.js 22+
- pnpm

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Testing

```bash
# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch or any release branch. The deployment is handled by the `.github/workflows/deploy-docs.yml` workflow.

## Architecture

- **React 19** - Modern React with hooks
- **TypeScript** - Full type safety
- **Vite** - Fast build tool and dev server
- **React Markdown** - Renders README.md dynamically
- **React Syntax Highlighter** - Beautiful code syntax highlighting
- **Vitest** - Fast unit testing framework

## Configuration

The site is configured to:
- Fetch the main README.md from the project root
- Use the `/fjell-registry/` base path for GitHub Pages
- Support dark theme code highlighting
- Include responsive breakpoints for mobile devices

## Contributing

The documentation site automatically reflects changes to the main README.md file. To update the site itself:

1. Make changes to the React components in `src/`
2. Test locally with `pnpm run dev`
3. Commit your changes
4. The site will automatically deploy via GitHub Actions
