# LIMS Codebase Guide for AI Coding Agents

## Project Overview
**LIMS** is an Angular 21 SSR (Server-Side Rendering) application with a modern standalone component architecture. It's built using Angular's latest standalone APIs, RxJS for reactive streams, and follows modular design patterns with strict TypeScript configuration.

## Architecture

### Core Directory Structure
- **`@shared/`** - Shared utilities, HTTP interceptors, components (e.g., loader), and the core logger
  - `http/` - HTTP interceptors: `ApiPrefixInterceptor` (auto-prefixes non-absolute URLs), `ErrorHandlerInterceptor` (catches all errors)
  - `logger.service.ts` - Production-aware logger with configurable log levels (Debug, Info, Warning, Error)
- **`core/`** - Application initialization services (e.g., `CoreService`)
- **`shell/`** - Root layout shell component that wraps main routes
- **`error/`** - Error page component for 404/error handling
- **`environments/`** - Multi-environment configs (development, staging, uat, qa, production)

### Path Aliases
TypeScript paths are configured for cleaner imports:
```
@app/*       → src/app/*
@shared      → src/app/@shared
@shared/*    → src/app/@shared/*
@env/*       → src/environments/*
```
Always use these aliases instead of relative imports.

## HTTP & API Communication

### HTTP Interceptors (Auto-Applied)
1. **ApiPrefixInterceptor** - Automatically prepends `environment.serverUrl` to relative URLs
   - Only affects URLs NOT starting with `http` or `https`
   - Example: `GET /api/users` → `GET http://my-dev-url/api/users`
2. **ErrorHandlerInterceptor** - Catches all HTTP errors via RxJS `catchError`
   - Logs errors in non-production environments using `Logger`
   - Can be extended in [error-handler.interceptor.ts](src/app/@shared/http/error-handler.interceptor.ts)

### Environment Configuration
- `environment.serverUrl` - API base URL (varies per environment)
- Environment files are generated at build time via `npm run write:env`
- Always import from `@env/environment` not relative paths

## Logging Pattern

Use the shared `Logger` class from `@shared`:
```typescript
import { Logger } from '@shared';
const log = new Logger('ComponentName');
log.debug('message');    // Debug level
log.info('message');     // Info level
log.warn('message');     // Warning level
log.error('message');    // Error level
```

Production mode disables debug/info logs automatically:
```typescript
Logger.enableProductionMode(); // Sets level to Warning
```

## Routing

- Routes defined in [app.routes.ts](src/app/app.routes.ts) (currently empty, must be extended)
- Shell component [shell.ts](src/app/shell/shell.ts) wraps all routed content
- Router imports: use `provideRouter(routes)` in standalone app config
- Reusable strategy available in [@shared/route-reusable-strategy.ts](src/app/@shared/route-reusable-strategy.ts)

## Key Conventions

### Component Structure
- **Standalone components** - All components use `imports: [...]` instead of NgModule declarations
- **SCSS styling** - Default style format (configured in angular.json)
- **Template property** - Use `templateUrl` not inline templates
- **Component selector** - Prefixed with `app-` (e.g., `app-loader`, `app-shell`)

### Service Injection
- Use `providedIn: 'root'` for services to enable tree-shaking
- Services are singleton by default in standalone apps
- Examples: `CoreService`, `Logger` (available app-wide)

### TypeScript Configuration
- **Strict mode enabled** - No implicit any, no implicit returns, no fallthrough cases
- **noImplicitOverride** - Must use `override` keyword when overriding methods
- **fullTemplateTypeCheck** - Strict Angular template type checking
- Path aliases required - no relative imports from sibling modules

## Build & Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server on localhost:4200 with auto-reload |
| `npm run build` | Production build (runs `write:env` first, outputs to `dist/`) |
| `npm run watch` | Watch mode for development builds |
| `npm run test` | Run Vitest unit tests |
| `npm test:ci` | CI pipeline: linting + tests + code style |
| `npm run serve:sw` | Build + serve with Service Worker from dist/ |
| `npm run lint` | Run TSLint + stylelint on SCSS |
| `npm run prettier` | Auto-format TypeScript, JavaScript, HTML, SCSS |
| `npm run generate` | Shortcut for `ng generate` (scaffolding) |

### Environment Setup
- `npm run write:env` must run before build/test (auto-runs in build/test scripts)
- Uses `ngx-scripts env npm_package_version` to inject build metadata

## Testing

- **Test framework**: Vitest (configured via angular.json)
- **Test files**: `*.spec.ts` files alongside source
- Run: `npm run test`
- CI mode: `npm run test:ci` (includes lint checks)

## Code Style

- **Prettier** - Auto-formats on postinstall
- **TSLint** - TypeScript linting
- **Stylelint** - SCSS/CSS linting
- Config file: `.prettierrc` in [package.json](package.json) (printWidth: 100, singleQuote: true)
- Check before commit: `npm run prettier:check`

## SSR & Client Hydration

- SSR support via `@angular/ssr` (Angular 21 feature)
- Client hydration enabled with `withEventReplay()` in [app.config.ts](src/app/app.config.ts)
- Server config: [app.config.server.ts](src/app/app.config.server.ts)
- Server routes: [app.routes.server.ts](src/app/app.routes.server.ts)

## Theme & UI

- **ngx-bootstrap** v20 for Bootstrap 4 components
- Theme configured via SCSS variables in [theme/](src/theme/)
- Bootstrap theme set to 'bs4' in [app.ts](src/app/app.ts) constructor
- Global styles in [styles.scss](src/styles.scss)

## External Dependencies

- **@angular/***: Core framework (v21)
- **rxjs**: Reactive programming (7.8.0)
- **ngx-bootstrap**: UI components (20.0.2)
- **ng-http-loader**: HTTP request loader (19.0.0)
- **@angular/ssr**: Server-side rendering

## When Adding Features

1. Define routes in [app.routes.ts](src/app/app.routes.ts)
2. Create components as standalone (use `ng generate component --standalone`)
3. Use `@shared` exports for common utilities (Logger, interceptors)
4. Import via path aliases (`@app/`, `@shared/`, `@env/`)
5. Add tests alongside implementation (`component.spec.ts`)
6. Run `npm run prettier` before commit
7. Ensure strict TypeScript compliance (no errors with strict mode)
