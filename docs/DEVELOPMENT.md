# Development Guide

This guide will help you set up your development environment for Spark-It.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL
- Docker (optional)
- Git

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/spark-it.git
cd spark-it
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
spark-it/
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Node.js backend
├── packages/
│   └── shared/          # Shared utilities
├── docker/              # Docker configuration
├── docs/                # Documentation
└── tools/               # Development tools
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "feat: add your feature"
```

3. Push your changes and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Code Style

We use:
- ESLint for linting
- Prettier for code formatting
- TypeScript for type checking

Run checks:
```bash
npm run lint
npm run format:check
npm run typecheck
```

## Testing

```bash
# Run all tests
npm run test

# Run specific tests
npm run test -- path/to/test

# Run tests in watch mode
npm run test:watch
```

## Building for Production

```bash
npm run build
# or
yarn build
```

## Debugging

1. VS Code Configuration:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/apps/server/src/main.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

2. Browser DevTools:
- Use React DevTools for component debugging
- Use Network tab for API requests
- Use Console for logging

## Common Issues

1. Database Connection:
```bash
# Check PostgreSQL status
pg_ctl status

# Reset database
npm run db:reset
```

2. Port Conflicts:
```bash
# Find process using port
netstat -ano | findstr :3000
```

3. Cache Issues:
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear build cache
npm run clean
```

## Best Practices

1. Code Quality
   - Write meaningful commit messages
   - Add comments for complex logic
   - Keep components small and focused
   - Use TypeScript properly

2. Performance
   - Optimize images and assets
   - Use lazy loading
   - Implement proper caching
   - Monitor bundle size

3. Security
   - Validate all inputs
   - Use prepared statements
   - Keep dependencies updated
   - Follow security guidelines

## Getting Help

- Check existing issues
- Join our Discord community
- Review documentation
- Ask in discussions
