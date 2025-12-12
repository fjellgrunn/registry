# Client API Documentation

Welcome to the comprehensive Client API documentation for the Fjell ecosystem. This section provides complete guidance for building resilient, production-ready applications with advanced error handling and retry logic.

## What's New

The Client API now includes enterprise-grade error handling and resilience features:

- **🔄 Automatic Retry Logic** - Exponential backoff with jitter for transient failures
- **🎯 Custom Error Types** - 10+ specific error classes for different scenarios
- **🛡️ Production Resilience** - Circuit breakers, graceful degradation, monitoring integration
- **⚙️ Flexible Configuration** - Environment-aware settings for dev, staging, and production
- **📊 Comprehensive Monitoring** - Error tracking, metrics, and alerting integration

## Documentation Sections

### Operations
Complete guides for all API operations with examples, error handling, and best practices:

- **[Operations Overview](./operations/README.md)** - Complete guide to all available operations
- **[All Operation](./operations/all.md)** - Retrieve multiple items with queries, pagination, and filtering
- **[Create Operation](./operations/create.md)** - Create new items with validation and batch operations
- **[Get Operation](./operations/get.md)** - Retrieve single items by key with caching strategies

### Error Handling & Resilience
Advanced error handling for production environments:

- **[Error Handling Overview](./error-handling/README.md)** - Comprehensive error handling system
- **[Network Errors](./error-handling/network-errors.md)** - Handle connection failures and timeouts

### Configuration
Complete setup and configuration guide:

- **[Configuration Guide](./configuration.md)** - API setup, authentication, and environment configuration

## Quick Start

### Basic Setup

```typescript
import { createPItemApi } from '@fjell/client-api';

const userApi = createPItemApi<User, 'user'>('user', ['users'], {
  baseUrl: 'https://api.example.com',
  enableErrorHandling: true,
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    enableJitter: true
  }
});
```

### With Error Handling

```typescript
try {
  const user = await userApi.create({
    name: 'John Doe',
    email: 'john@example.com'
  });

  console.log('User created:', user.id);
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    error.validationErrors.forEach(err => {
      console.log(`${err.field}: ${err.message}`);
    });
  } else if (error.code === 'NETWORK_ERROR') {
    // Network errors are automatically retried
    console.log('Network issue resolved or exhausted retries');
  }
}
```

## Key Features

### Error Types Handled

| Error Type | Code | Retryable | Description |
|------------|------|-----------|-------------|
| **NetworkError** | `NETWORK_ERROR` | ✅ | Connection failures, DNS issues |
| **TimeoutError** | `TIMEOUT_ERROR` | ✅ | Request timeouts |
| **ServerError** | `SERVER_ERROR` | ✅ | 5xx HTTP status codes |
| **RateLimitError** | `RATE_LIMIT_ERROR` | ✅ | 429 Too Many Requests |
| **AuthenticationError** | `AUTHENTICATION_ERROR` | ❌ | 401 Unauthorized |
| **ValidationError** | `VALIDATION_ERROR` | ❌ | 400 Bad Request |
| **NotFoundError** | `NOT_FOUND_ERROR` | ❌ | 404 Not Found |

### Production Configuration

```typescript
const productionConfig = {
  baseUrl: 'https://api.example.com',
  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 60000,
    backoffMultiplier: 1.5,
    enableJitter: true
  },
  errorHandler: (error, context) => {
    // Send to monitoring service
    monitoring.recordError(error, context);

    // Business-specific error handling
    if (error.code === 'PAYMENT_FAILED') {
      notificationService.sendPaymentFailure(context.customerId);
    }
  }
};
```

## Examples

See the [Examples](../examples-README.md) section for complete usage scenarios including:

- Simple API operations with error handling
- Enterprise e-commerce platform patterns
- Comprehensive error handling demonstrations
- Production configuration examples

## Support

For additional help:

- Review the detailed operation guides in the Operations section
- Check the Error Handling section for resilience patterns
- Explore the Configuration guide for setup options
- See the Examples for complete working code

---

*Built with comprehensive error handling and production resilience in mind.*
