# monorepo
# DexTrade Monorepo

A monorepo containing frontend DexTrade applications and shared packages. This repository includes web applications, services, and shared libraries for the DexTrade ecosystem.

## Project Structure

### Applications (`/apps`)

- **web-tools** - Trading and asset management tools
- **web-wallet** - Web-based wallet application
- **invoices** - Invoice management system
- **dexpay** - Payment processing application
- **plans** - Subscription and plan management

### Shared Packages (`/packages`)

- **dex-helpers** - Utility functions and helpers
- **dex-connect** - Wallet connection and blockchain interaction
- **dex-ui** - Shared UI component library
- **dex-services** - Service layer functionality

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Git

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/dextrade/monorepo.git
cd monorepo
```

2. Install dependencies:
```bash
yarn install
```

3. Build shared packages:
```bash
yarn build:packages
```

4. Start development server for any application:
```bash
cd apps/web-tools
yarn dev
```

## Development

### Available Scripts

- `yarn install` - Install all dependencies
- `yarn build:packages` - Build all shared packages
- `yarn test` - Run tests across all packages
- `yarn lint` - Run linting across all packages
- `yarn clean` - Clean build artifacts

### Working with Packages

Each package in `/packages` can be developed and tested independently:

```bash
cd packages/dex-ui
yarn dev
```

### Working with Apps

Each application in `/apps` can be developed independently:

```bash
cd apps/web-tools
yarn dev
```

## Architecture

The monorepo follows a modular architecture where:

- Shared packages provide core functionality
- Applications consume these packages
- Each application can be deployed independently
- Common code is shared through packages

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Deployment

Each application has its own deployment process. Refer to the individual application READMEs for specific deployment instructions.

## Security

This repository contains sensitive code for handling payments and wallet operations. Always:
- Follow security best practices
- Keep dependencies up to date
- Review code changes carefully
- Use secure development practices

## License

Copyright (c) Dextrade 2025

All rights reserved.

This software is proprietary and confidential. No part of this software may be used, copied, modified, distributed, or reverse-engineered without the express written permission of the author.

To request permission, contact: dev@dextrade.com
