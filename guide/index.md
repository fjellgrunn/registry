# @fjell/registry - Agentic Guide

## Purpose

Dependency injection and service registry utilities for composing Fjell systems.

This guide is optimized for AI-assisted code generation and integration workflows.

## Documentation

- **[Usage Guide](./usage.md)** - API-oriented usage patterns and model-safe examples
- **[Integration Guide](./integration.md)** - Architecture placement, composition rules, and implementation guidance

## Key Capabilities

- Registers and resolves service instances with typed lookups
- Supports registry hubs and stats for larger multi-service deployments
- Centralizes dependency wiring for app bootstrap and tests

## Installation

```bash
npm install @fjell/registry
```

## Public API Highlights

- `Registry`, `RegistryHub`, and `Instance` helpers
- `RegistryStats` for observability
- Registry error and type exports for safe composition
