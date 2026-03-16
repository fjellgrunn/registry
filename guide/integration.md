# Integration Guide

Guide for integrating `@fjell/registry` into larger Fjell-based systems.

## Where It Fits

Dependency injection and service registry utilities for composing Fjell systems.

## Recommended Integration Pattern

- Create one root registry per runtime process and pass scoped registries into modules
- Prefer constructor injection from registry values over hidden singleton imports
- Mock registry entries in tests to isolate network and storage dependencies

## System Composition Checklist

- Define package boundaries: schema/types, transport, operations, adapters, and UI.
- Keep contracts stable by sharing @fjell/types interfaces where applicable.
- Centralize retries/timeouts/logging around infrastructure-facing operations.
- Validate inputs at API boundaries before invoking persistence or provider layers.
- Add contract and integration tests for every generated workflow.

## Cross-Library Pairings

- Pair with @fjell/types for shared contracts.
- Pair with @fjell/validation for input and schema checks.
- Pair with @fjell/logging for observability in integration flows.
- Pair with storage/router/provider packages based on your runtime architecture.

## Integration Example Shape

Use this package behind an application service layer that exposes stable domain methods. Generated code should call those service methods, not raw infrastructure primitives, unless your architecture intentionally keeps infrastructure at the edge.
