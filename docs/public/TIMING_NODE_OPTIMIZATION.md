# Node.js Optimization for Timing Tests

This document outlines Node.js runtime parameters that can be tuned to minimize interference and improve timing test accuracy.

## Quick Start: Optimized Timing Test

```bash
pnpm run test:timing:optimized
```

This runs timing tests with pre-configured optimal Node.js flags.

## Key Node.js Optimization Flags

### Memory Management

#### `--max-old-space-size=8192`
- **Purpose**: Increases maximum heap size to 8GB (default ~1.4GB)
- **Benefit**: Prevents garbage collection during test runs
- **Why 8GB**: Provides ample headroom for 100 rounds × multiple tree sizes
- **Alternative**: `--max-old-space-size=4096` for systems with less RAM

#### `--max-semi-space-size=1024`
- **Purpose**: Increases semi-space size to 1GB (default varies)
- **Benefit**: Reduces minor GC frequency during object allocation
- **Impact**: Each semi-space can hold more objects before collection

### Garbage Collection Control

#### `--expose-gc`
- **Purpose**: Exposes `global.gc()` function for manual garbage collection
- **Benefit**: Allows forced GC between test rounds for consistent baselines
- **Usage**: Can trigger GC at specific points to isolate timing measurements

#### `--gc-interval=1000000`
- **Purpose**: Reduces GC frequency (higher number = less frequent)
- **Benefit**: Minimizes GC interruptions during timing measurements
- **Trade-off**: Uses more memory but provides consistent timing

### Execution Predictability

#### `--predictable`
- **Purpose**: Makes execution more deterministic
- **Benefit**: Reduces timing variance from non-deterministic optimizations
- **Impact**: Slightly slower but more consistent measurements

#### `--no-compilation-cache`
- **Purpose**: Disables V8 compilation cache
- **Benefit**: Ensures consistent JIT compilation behavior across runs
- **Use Case**: When testing cold start performance or eliminating cache effects

### JIT Compilation Control

#### `--optimize-for-size`
- **Purpose**: Optimizes for code size rather than speed
- **Benefit**: More predictable compilation behavior
- **Alternative**: `--max-opt` for maximum optimization (less predictable)

#### `--no-opt`
- **Purpose**: Disables JIT compilation entirely
- **Benefit**: Eliminates JIT timing variance (but much slower execution)
- **Use Case**: Testing interpreter-only performance

## Complete Optimization Command

For maximum timing accuracy, use all optimization flags:

```bash
# Use NODE_OPTIONS for compatibility with modern Node.js
NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=1024" \
vitest run tests/timing.test.ts

# Or use direct node invocation (requires vitest executable)
node --max-old-space-size=8192 --max-semi-space-size=1024 \
./node_modules/vitest/vitest.mjs run tests/timing.test.ts
```

## System-Specific Adjustments

### Low-Memory Systems (< 8GB RAM)
```bash
NODE_OPTIONS="--max-old-space-size=2048 --max-semi-space-size=256" \
vitest run tests/timing.test.ts
```

### High-Memory Systems (> 16GB RAM)
```bash
NODE_OPTIONS="--max-old-space-size=16384 --max-semi-space-size=2048" \
vitest run tests/timing.test.ts
```

### Docker/Container Environments
```bash
NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=512" \
vitest run tests/timing.test.ts
```

## Environment Variables

### Additional V8 Options
```bash
export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=1024"
```

### Memory Monitoring
```bash
export NODE_ENV=production  # Disable development overhead
export UV_THREADPOOL_SIZE=8  # Increase thread pool if needed
```

## Monitoring Memory During Tests

Add memory monitoring to timing tests:

```typescript
// Add to timing test setup
if (global.gc) {
  console.log('Memory before tests:', process.memoryUsage());
  global.gc();
}

// Add between test rounds
if (global.gc && round % 20 === 0) {
  global.gc();
  console.log(`Memory after round ${round}:`, process.memoryUsage());
}
```

## Platform-Specific Considerations

### macOS
- Default memory limits are generous
- Use `--max-old-space-size=8192` safely
- Activity Monitor shows Node.js memory usage

### Linux
- Check `ulimit -v` for virtual memory limits
- May need `sudo sysctl vm.max_map_count=262144` for large heaps
- Use `htop` or `ps` to monitor memory

### Windows
- WSL may have memory constraints
- PowerShell: `Get-Process node | Select-Object WorkingSet64`
- Task Manager shows detailed memory breakdown

### CI/CD Environments
- GitHub Actions: 7GB RAM limit, use `--max-old-space-size=4096`
- GitLab CI: Variable memory, check runner specs
- Docker: Set container memory limits appropriately

## Performance Analysis Tools

### V8 Profiling
```bash
node --prof --log-timer-events ./timing-test.js
```

### Heap Snapshots
```bash
node --inspect --heap-prof ./timing-test.js
```

### GC Logging
```bash
node --trace-gc --trace-gc-verbose ./timing-test.js
```

## Validation

Test that optimizations are working:

```bash
# Run normal timing tests
pnpm run test:timing

# Run optimized timing tests
pnpm run test:timing:optimized

# Compare results - optimized should show:
# 1. Lower timing variance (smaller standard deviations)
# 2. More consistent Bollinger bands
# 3. Fewer outlier measurements
# 4. Reduced memory-related timing spikes
```

## Recommended Configuration

For most use cases, the optimized configuration provides the best balance:

```json
{
  "scripts": {
    "test:timing:optimized": "NODE_OPTIONS=\"--max-old-space-size=8192 --max-semi-space-size=1024\" vitest run tests/timing.test.ts"
  }
}
```

This configuration:
- ✅ Eliminates most GC interference
- ✅ Provides consistent execution
- ✅ Works on most development machines
- ✅ Maintains reasonable test execution time
- ✅ Produces reliable performance metrics

---

*For production timing analysis, always use optimized Node.js flags to ensure accurate performance measurements.*
