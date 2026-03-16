# Usage Guide

Comprehensive usage guidance for `@fjell/registry`.

## Installation

```bash
npm install @fjell/registry
```

## API Highlights

- `Registry`, `RegistryHub`, and `Instance` helpers
- `RegistryStats` for observability
- Registry error and type exports for safe composition

## Quick Example

```ts
import { Registry } from "@fjell/registry";

const registry = new Registry();
registry.register("logger", { info: console.log });

const logger = registry.get("logger");
logger.info("Registry wired");
```

## Model Consumption Rules

1. Import from the package root (`@fjell/registry`) instead of deep-internal paths unless explicitly documented.
2. Keep usage aligned with exported public symbols listed in this guide.
3. Prefer explicit typing at package boundaries so generated code remains robust during upgrades.
4. Keep error handling deterministic and map infrastructure failures into domain-level errors.
5. Co-locate integration wrappers in your app so model-generated code has one canonical entry point.

## Best Practices

- Keep examples and abstractions consistent with existing Fjell package conventions.
- Favor composable wrappers over one-off inline integration logic.
- Add targeted tests around generated integration code paths.
