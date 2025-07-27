# Timing Test System

This document explains the timing test system implemented for the @fjell/registry project.

## Overview

The timing test system measures the performance of key operations in the fjell-registry library using robust multi-round testing and generates comprehensive documentation including heatmap visualizations. It runs hundreds of test rounds to smooth out system load variations and provides reliable performance metrics. The system ensures that performance remains within acceptable bounds and helps detect performance regressions.

## Running Timing Tests

```bash
# Run timing tests specifically
npm run test:timing

# Run all tests (including timing tests)
npm test
```

## Measured Operations

The timing system measures the following operations:

- **createRegistry**: Time to create a new registry
- **createRegistryHub**: Time to create a new registry hub
- **createInstance**: Time to create a new instance
- **registerInstance**: Time to register an instance in registry
- **lookupInstance**: Time to lookup an existing instance from registry
- **completeWorkflow**: Time for complete workflow including all operations

### Scaling Tests

Additionally, the system includes comprehensive scaling tests that measure performance across a wide range of tree sizes:

- **Tree sizes tested**: 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000
- **registerInstance_[size]**: Registration performance with varying numbers of existing items
- **lookupInstance_[size]**: Lookup performance with different tree sizes

These extensive tests help identify potential O(n) performance issues and ensure the registry scales well from small applications to enterprise-scale deployments.

## Timing Constraints

The following timing constraints are enforced (all values in microseconds):

### Basic Operations
- **createRegistry**: ≤ 5000µs (5ms)
- **createRegistryHub**: ≤ 5000µs (5ms)
- **createInstance**: ≤ 10000µs (10ms)
- **lookupInstance**: ≤ 2000µs (2ms)
- **registerInstance**: ≤ 5000µs (5ms)
- **completeWorkflow**: ≤ 25000µs (25ms)

### Scaling Operations
- **registerInstance** (≤100 items): ≤ 5000µs (5ms)
- **registerInstance** (100-1000 items): ≤ 10000µs (10ms)
- **registerInstance** (1000-10000 items): ≤ 20000µs (20ms)
- **registerInstance** (>10000 items): ≤ 50000µs (50ms)
- **lookupInstance** (≤100 items): ≤ 2000µs (2ms)
- **lookupInstance** (100-1000 items): ≤ 5000µs (5ms)
- **lookupInstance** (1000-10000 items): ≤ 10000µs (10ms)
- **lookupInstance** (>10000 items): ≤ 25000µs (25ms)

## Configuration

### Adjusting Timing Constraints

Edit the `TIMING_CONSTRAINTS` object in `tests/timing.test.ts`:

```typescript
const TIMING_CONSTRAINTS: TimingConstraints = {
  createRegistry: 5000,      // 5000µs (5ms) max
  createRegistryHub: 5000,   // 5000µs (5ms) max
  createInstance: 10000,     // 10000µs (10ms) max
  lookupInstance: 2000,      // 2000µs (2ms) max
  registerInstance: 5000,    // 5000µs (5ms) max
};
```

### Adjusting Test Iterations

Change the `ITERATIONS` constant to adjust the number of test iterations:

```typescript
const ITERATIONS = 1000; // Number of iterations for timing tests
```

## Generated Documentation

When timing tests run, they automatically generate documentation at `./docs/timing.md`. This file includes:

- Performance summary table for basic operations
- Scaling performance table showing results for different tree sizes
- **SVG performance graph** visualizing scaling trends (`./docs/scaling-performance.svg`)
- **SVG performance range chart** showing performance consistency with ±1σ bands (`./docs/timing-range.svg`)
- Detailed timing results for each operation (in microseconds)
- Performance analysis and scaling recommendations
- System information (Node.js version, platform, etc.)

### Multi-Round Testing

The system runs 100 test rounds (configurable) for smaller tree sizes and reduces rounds for larger sizes to balance thoroughness with test duration:

- **≤1000 items**: 100 rounds × 200 iterations = ~20,000 measurements per operation
- **1000-10000 items**: 50 rounds × 100 iterations = ~5,000 measurements per operation
- **>10000 items**: 25 rounds × 50 iterations = ~1,250 measurements per operation

For performance range visualization, the system calculates mean and standard deviation for each tree size, displaying ±1σ confidence bands that show performance consistency.

**Randomized Batching**: Instead of running all iterations sequentially, the system uses randomized batch sizes (10-50 iterations) with brief pauses between batches. This approach simulates real-world usage patterns and prevents artificial performance artifacts from caching, JIT optimization, and memory allocation patterns.

This comprehensive approach provides robust results that smooth out system load variations and clearly show performance characteristics and variability.

## Best Practices

### When to Update Constraints

- **After optimization**: If you've improved performance, consider tightening constraints
- **Hardware changes**: Adjust constraints when changing build/test infrastructure
- **Performance regressions**: Investigate and fix before loosening constraints

### Interpreting Results

- **Average Time**: Most important metric for consistent performance
- **Max Time**: Helps identify performance spikes
- **Min Time**: Usually very low due to CPU caching effects

### Troubleshooting Failed Tests

If timing tests fail:

1. **Check recent changes**: Review code changes that might affect performance
2. **System load**: Ensure the system isn't under heavy load during testing
3. **Multiple runs**: Run tests multiple times to account for system variance
4. **Profile code**: Use Node.js profiling tools to identify bottlenecks

## Integration with CI/CD

The timing tests are designed to be run in CI/CD pipelines:

- Tests fail if performance thresholds are exceeded
- Documentation is automatically updated on each run
- Results can be tracked over time to monitor performance trends

## File Structure

```
docs/
├── timing.md           # Generated timing report (auto-updated)
└── TIMING_README.md    # This documentation file

tests/
└── timing.test.ts      # Timing test implementation
```

## Maintenance

### Regular Tasks

1. **Review thresholds** quarterly to ensure they remain appropriate
2. **Update documentation** after significant performance improvements
3. **Monitor trends** in the generated timing reports over releases

### Release Process

The timing documentation (`docs/timing.md`) should be:

1. Generated before each release
2. Committed to the repository
3. Published with the package

This ensures users can see performance characteristics of each version.
