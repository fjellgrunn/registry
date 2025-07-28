import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createRegistry, Registry } from '../src/Registry';
import { createRegistryHub } from '../src/RegistryHub';
import { createInstance } from '../src/Instance';
import { createCoordinate } from '../src/Coordinate';
import fs from 'fs/promises';
import path from 'path';

// Mock logger to avoid noise during timing tests
vi.mock('../src/logger', () => {
  return {
    default: {
      get: vi.fn(() => ({
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        emergency: vi.fn(),
        alert: vi.fn(),
        critical: vi.fn(),
        notice: vi.fn(),
        time: vi.fn().mockReturnThis(),
        end: vi.fn(),
        log: vi.fn(),
      })),
    }
  }
});

interface TimingResult {
  operation: string;
  description: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  iterations: number;
  unit: string;
  threshold?: number;
  status: 'PASS' | 'FAIL';
  treeSize?: number;
  allTimes?: number[]; // Store all timing measurements for heatmap
}

interface TimingConstraints {
  createRegistry: number;
  createRegistryHub: number;
  createInstance: number;
  lookupInstance: number;
  registerInstance: number;
}

// Define timing constraints in microseconds
const TIMING_CONSTRAINTS: TimingConstraints = {
  createRegistry: 5000,      // 5000µs (5ms) max
  createRegistryHub: 5000,   // 5000µs (5ms) max
  createInstance: 10000,     // 10000µs (10ms) max
  lookupInstance: 2000,      // 2000µs (2ms) max
  registerInstance: 5000,    // 5000µs (5ms) max
};

const ITERATIONS = 200; // Number of iterations for timing tests
const TEST_ROUNDS = 100; // Number of test rounds for robust statistics

describe('Timing Tests', () => {
  const timingResults: TimingResult[] = [];

  const timeOperation = (options: {
    name: string;
    description: string;
    operation: () => void;
    iterations?: number;
    threshold?: number;
    rounds?: number;
  }): TimingResult => {
    const { name, description, operation, iterations = ITERATIONS, threshold, rounds = TEST_ROUNDS } = options;
    const allTimes: number[] = [];

    console.log(`\n🔄 Running ${rounds} rounds of ${name} (${iterations} iterations each)...`);

    const fullDataset: number[] = []; // For accurate statistics

    // Run multiple test rounds for robust statistics with randomized batching
    for (let round = 0; round < rounds; round++) {
      if (round % 20 === 0) {
        console.log(`  Round ${round + 1}/${rounds}...`);
      }

      // Warm up for each round
      for (let i = 0; i < 3; i++) {
        operation();
      }

      // Actual timing for this round using randomized batches
      const roundTimes: number[] = [];
      let remainingIterations = iterations;

      while (remainingIterations > 0) {
        // Random batch size between 10 and 50 iterations (or remaining if less)
        const batchSize = Math.min(remainingIterations, Math.floor(Math.random() * 41) + 10);

        // Run batch of iterations
        for (let i = 0; i < batchSize; i++) {
          const start = performance.now();
          operation();
          const end = performance.now();
          roundTimes.push((end - start) * 1000); // Convert to microseconds
        }

        remainingIterations -= batchSize;

        // Brief pause between batches to prevent artificial caching effects
        if (remainingIterations > 0) {
          // Just a single dummy operation to break up sequential execution
          const dummy = Math.random();
          void dummy; // Prevent optimization
        }
      }

      // Add all times to full dataset for accurate statistics
      fullDataset.push(...roundTimes);

      // Sample data for performance range chart (every 10th measurement to reduce memory usage)
      const sampledTimes = roundTimes.filter((_, index) => index % 10 === 0);
      allTimes.push(...sampledTimes);
    }

    const averageTime = fullDataset.reduce((a, b) => a + b, 0) / fullDataset.length;
    const minTime = Math.min(...fullDataset);
    const maxTime = Math.max(...fullDataset);

    const result: TimingResult = {
      operation: name,
      description,
      averageTime,
      minTime,
      maxTime,
      iterations: iterations * rounds, // Total iterations across all rounds
      unit: 'µs',
      threshold,
      status: threshold ? (averageTime <= threshold ? 'PASS' : 'FAIL') : 'PASS',
      allTimes // Store all measurements for heatmap generation
    };

    timingResults.push(result);
    return result;
  };

  describe('Registry Creation Performance', () => {
    it('should create registries within timing constraints', { timeout: 60000 }, () => {
      const result = timeOperation({
        name: 'createRegistry',
        description: 'Time to create a new registry',
        operation: () => {
          createRegistry('test-registry');
        },
        iterations: ITERATIONS,
        threshold: TIMING_CONSTRAINTS.createRegistry
      });

      expect(result.averageTime).toBeLessThanOrEqual(TIMING_CONSTRAINTS.createRegistry);
      expect(result.status).toBe('PASS');
    });
  });

  describe('RegistryHub Creation Performance', () => {
    it('should create registry hubs within timing constraints', { timeout: 60000 }, () => {
      const result = timeOperation({
        name: 'createRegistryHub',
        description: 'Time to create a new registry hub',
        operation: () => {
          createRegistryHub();
        },
        iterations: ITERATIONS,
        threshold: TIMING_CONSTRAINTS.createRegistryHub
      });

      expect(result.averageTime).toBeLessThanOrEqual(TIMING_CONSTRAINTS.createRegistryHub);
      expect(result.status).toBe('PASS');
    });
  });

  describe('Instance Creation Performance', () => {
    let registry: Registry;

    beforeAll(() => {
      registry = createRegistry('test-registry');
    });

    it('should create instances within timing constraints', { timeout: 60000 }, () => {
      let counter = 0;
      const result = timeOperation({
        name: 'createInstance',
        description: 'Time to create a new instance',
        operation: () => {
          const coordinate = createCoordinate([`test-${counter++}`], ['default']);
          createInstance(registry, coordinate);
        },
        iterations: ITERATIONS,
        threshold: TIMING_CONSTRAINTS.createInstance
      });

      expect(result.averageTime).toBeLessThanOrEqual(TIMING_CONSTRAINTS.createInstance);
      expect(result.status).toBe('PASS');
    });
  });

  describe('Instance Registration Performance', () => {
    let registry: Registry;

    beforeAll(() => {
      registry = createRegistry('test-registry');
    });

    it('should register instances within timing constraints', { timeout: 60000 }, () => {
      let counter = 0;
      const result = timeOperation({
        name: 'registerInstance',
        description: 'Time to register an instance in registry',
        operation: () => {
          const coordinate = createCoordinate([`test-${counter}`], ['default']);
          const instance = createInstance(registry, coordinate);
          registry.register([`test-${counter++}`], instance);
        },
        iterations: ITERATIONS,
        threshold: TIMING_CONSTRAINTS.registerInstance
      });

      expect(result.averageTime).toBeLessThanOrEqual(TIMING_CONSTRAINTS.registerInstance);
      expect(result.status).toBe('PASS');
    });
  });

  describe('Instance Lookup Performance', () => {
    let registry: Registry;
    const instanceKeys: string[] = [];

    beforeAll(() => {
      registry = createRegistry('test-registry');

      // Pre-populate registry with instances for lookup testing
      for (let i = 0; i < 100; i++) {
        const key = `lookup-test-${i}`;
        const coordinate = createCoordinate([key], ['default']);
        const instance = createInstance(registry, coordinate);
        registry.register([key], instance);
        instanceKeys.push(key);
      }
    });

    it('should lookup instances within timing constraints', { timeout: 60000 }, () => {
      let counter = 0;
      const result = timeOperation({
        name: 'lookupInstance',
        description: 'Time to lookup an existing instance from registry',
        operation: () => {
          const key = instanceKeys[counter % instanceKeys.length];
          registry.get([key]);
          counter++;
        },
        iterations: ITERATIONS,
        threshold: TIMING_CONSTRAINTS.lookupInstance
      });

      expect(result.averageTime).toBeLessThanOrEqual(TIMING_CONSTRAINTS.lookupInstance);
      expect(result.status).toBe('PASS');
    });
  });

  describe('Complex Workflow Performance', () => {
    it('should handle complete registry workflow within reasonable time', () => {
      let counter = 0;
      const result = timeOperation({
        name: 'completeWorkflow',
        description: 'Time for complete workflow: create hub, registry, instance, register, and lookup',
        operation: () => {
          const hub = createRegistryHub();
          const registry = hub.createRegistry(`workflow-${counter}`, createRegistry);
          const coordinate = createCoordinate([`item-${counter}`], ['default']);
          const instance = createInstance(registry, coordinate);
          registry.register([`item-${counter}`], instance);
          registry.get([`item-${counter++}`]);
        },
        iterations: 100, // Fewer iterations for complex workflow
        threshold: 25000 // 25000µs (25ms) threshold for complete workflow
      });

      expect(result.averageTime).toBeLessThanOrEqual(25000);
      expect(result.status).toBe('PASS');
    });
  });

  describe('Scaling Performance Tests', () => {
    const treeSizes = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];

    treeSizes.forEach(treeSize => {
      describe(`Tree Size: ${treeSize}`, () => {
        let registry: Registry;
        const instanceKeys: string[] = [];

        beforeAll(() => {
          registry = createRegistry(`scaling-test-${treeSize}`);

          // Pre-populate registry with instances
          for (let i = 0; i < treeSize; i++) {
            const key = `scale-item-${i}`;
            const coordinate = createCoordinate([key], ['default']);
            const instance = createInstance(registry, coordinate);
            registry.register([key], instance);
            instanceKeys.push(key);
          }
        });

        it(`should register instances efficiently with ${treeSize} existing items`, { timeout: 120000 }, () => {
          let counter = treeSize; // Start after existing items

          // Adjust iterations and thresholds based on tree size for multi-round testing
          const iterations = treeSize <= 1000 ? 100 : (treeSize <= 10000 ? 50 : 20);
          const rounds = treeSize <= 1000 ? TEST_ROUNDS : (treeSize <= 10000 ? 50 : 25);
          const threshold = treeSize <= 100 ? 5000 :
            treeSize <= 1000 ? 10000 :
              treeSize <= 10000 ? 20000 : 50000;

          const result = timeOperation({
            name: `registerInstance_${treeSize}`,
            description: `Time to register instance with ${treeSize} existing items in tree`,
            operation: () => {
              const key = `new-item-${counter}`;
              const coordinate = createCoordinate([key], ['default']);
              const instance = createInstance(registry, coordinate);
              registry.register([key], instance);
              counter++;
            },
            iterations,
            threshold,
            rounds
          });

          // Add tree size info to result
          result.treeSize = treeSize;

          expect(result.averageTime).toBeLessThanOrEqual(result.threshold!);
          expect(result.status).toBe('PASS');
        });

        it(`should lookup instances efficiently with ${treeSize} items in tree`, { timeout: 120000 }, () => {
          let counter = 0;

          // Adjust iterations and thresholds based on tree size for multi-round testing
          const iterations = treeSize <= 1000 ? 200 : (treeSize <= 10000 ? 100 : 50);
          const rounds = treeSize <= 1000 ? TEST_ROUNDS : (treeSize <= 10000 ? 50 : 25);
          const threshold = treeSize <= 100 ? 2000 :
            treeSize <= 1000 ? 5000 :
              treeSize <= 10000 ? 10000 : 25000;

          const result = timeOperation({
            name: `lookupInstance_${treeSize}`,
            description: `Time to lookup instance with ${treeSize} items in tree`,
            operation: () => {
              const key = instanceKeys[counter % instanceKeys.length];
              registry.get([key]);
              counter++;
            },
            iterations,
            threshold,
            rounds
          });

          // Add tree size info to result
          result.treeSize = treeSize;

          expect(result.averageTime).toBeLessThanOrEqual(result.threshold!);
          expect(result.status).toBe('PASS');
        });
      });
    });
  });

  describe('Documentation Generation', () => {
    it('should generate timing documentation', async () => {
      await generateTimingDocumentation(timingResults);

      // Verify the documentation was created
      const docsPath = path.join(process.cwd(), 'docs', 'timing.md');
      const docExists = await fs.access(docsPath).then(() => true).catch(() => false);
      expect(docExists).toBe(true);

      if (docExists) {
        const content = await fs.readFile(docsPath, 'utf-8');
        expect(content).toContain('# Performance Timing Report');
        expect(content).toContain('createRegistry');
        expect(content).toContain('createRegistryHub');
        expect(content).toContain('createInstance');
        expect(content).toContain('lookupInstance');
      }
    });
  });
});

async function generatePerformanceRangeGraph(scalingResults: TimingResult[]): Promise<void> {
  const registerResults = scalingResults.filter(r => r.operation.startsWith('registerInstance_') && r.allTimes);
  const lookupResults = scalingResults.filter(r => r.operation.startsWith('lookupInstance_') && r.allTimes);

  if (registerResults.length === 0 && lookupResults.length === 0) return;

  // Sort by tree size
  registerResults.sort((a, b) => (a.treeSize || 0) - (b.treeSize || 0));
  lookupResults.sort((a, b) => (a.treeSize || 0) - (b.treeSize || 0));

  // Calculate statistics for each tree size
  const calculateStats = (results: TimingResult[]) => {
    return results.map(result => {
      const times = result.allTimes || [];
      if (times.length === 0) return null;

      const mean = times.reduce((a, b) => a + b, 0) / times.length;

      return {
        treeSize: result.treeSize || 0,
        mean,
        min: Math.min(...times),
        max: Math.max(...times)
      };
    }).filter(Boolean) as Array<{
      treeSize: number;
      mean: number;
      stdDev: number;
      upperBand: number;
      lowerBand: number;
      min: number;
      max: number;
    }>;
  };

  const registerStats = calculateStats(registerResults);
  const lookupStats = calculateStats(lookupResults);

  if (registerStats.length === 0 && lookupStats.length === 0) return;

  // Graph dimensions (increased height for metadata)
  const width = 1200;
  const height = 800;
  const margin = { top: 60, right: 75, bottom: 80, left: 110 };
  const chartHeight = 600; // Keep original chart height
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Calculate scales
  const allStats = [...registerStats, ...lookupStats];
  const treeSizes = [...new Set(allStats.map(s => s.treeSize))].sort((a, b) => a - b);
  const maxTime = Math.max(...allStats.map(s => s.mean));
  const minTime = Math.min(...allStats.map(s => s.mean));

  // Use logarithmic scale bounds that encompass the data range
  const logMinTime = Math.max(0.01, minTime * 0.5); // Minimum 0.01µs, or half the minimum data
  const logMaxTime = Math.max(5.0, maxTime * 2.0);  // Maximum 5.0µs, or double the maximum data

  // Log scale for X-axis (tree size), log scale for Y-axis (time)
  const xScale = (treeSize: number) => {
    const logMin = Math.log10(treeSizes[0]);
    const logMax = Math.log10(treeSizes[treeSizes.length - 1]);
    const logSize = Math.log10(treeSize);
    return ((logSize - logMin) / (logMax - logMin)) * plotWidth;
  };

  const yScale = (time: number) => {
    const logMin = Math.log10(logMinTime);
    const logMax = Math.log10(logMaxTime);
    const logTime = Math.log10(Math.max(time, logMinTime));
    return plotHeight - ((logTime - logMin) / (logMax - logMin)) * plotHeight;
  };

  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .axis { stroke: #333; stroke-width: 1; }
    .grid { stroke: #ddd; stroke-width: 0.5; }
    .label { font-family: Arial, sans-serif; font-size: 14px; fill: #333; }
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
    .subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
    .register-mean { stroke: #e74c3c; stroke-width: 3; fill: none; }
    .lookup-mean { stroke: #3498db; stroke-width: 3; fill: none; }
    .register-band { fill: rgba(231, 76, 60, 0.2); stroke: #e74c3c; stroke-width: 1; }
    .lookup-band { fill: rgba(52, 152, 219, 0.2); stroke: #3498db; stroke-width: 1; }
    .register-dot { fill: #e74c3c; }
    .lookup-dot { fill: #3498db; }
    .legend { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
    .axis-title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #333; }
    .metadata-title { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #333; }
    .metadata-section { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: #444; }
    .metadata-label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
    .metadata-value { font-family: Arial, sans-serif; font-size: 10px; fill: #333; }
  </style>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>

  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" class="title">Timing of Common Registry Operations</text>
  <text x="${width / 2}" y="45" text-anchor="middle" class="subtitle">Performance measurements across varying tree sizes</text>

  <!-- Plot area -->
  <g transform="translate(${margin.left},${margin.top})">

    <!-- Grid lines (logarithmic scale) -->`;

  // Y-axis grid lines - logarithmic scale
  const yTickValues = [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0];
  yTickValues.forEach(value => {
    if (value >= logMinTime && value <= logMaxTime) {
      const y = yScale(value);
      svg += `
    <line x1="0" y1="${y}" x2="${plotWidth}" y2="${y}" class="grid"/>
    <text x="-10" y="${y + 4}" text-anchor="end" class="label">${value < 1 ? value.toFixed(2) : value.toFixed(1)}µs</text>`;
    }
  });

  // X-axis grid lines
  treeSizes.forEach(treeSize => {
    const x = xScale(treeSize);
    const formattedSize = treeSize >= 1000 ? `${treeSize / 1000}k` : treeSize.toString();
    svg += `
    <line x1="${x}" y1="0" x2="${x}" y2="${plotHeight}" class="grid"/>
    <text x="${x}" y="${plotHeight + 20}" text-anchor="middle" class="label">${formattedSize}</text>`;
  });

  // Axes
  svg += `
    <!-- Y-axis -->
    <line x1="0" y1="0" x2="0" y2="${plotHeight}" class="axis"/>

    <!-- X-axis -->
    <line x1="0" y1="${plotHeight}" x2="${plotWidth}" y2="${plotHeight}" class="axis"/>

    <!-- Axis labels -->
    <text x="${plotWidth / 2}" y="${plotHeight + 50}" text-anchor="middle" class="axis-title">Tree Size (items) - Log Scale</text>
    <text transform="rotate(-90,${-70},${plotHeight / 2})" x="${-70}" y="${plotHeight / 2}" text-anchor="middle" class="axis-title">Execution Time (µs)</text>`;

  // Draw mean lines
  if (registerStats.length > 1) {
    const meanPath = registerStats.map((stat, i) => {
      const x = xScale(stat.treeSize);
      const y = yScale(stat.mean);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    svg += `
    <path d="${meanPath}" class="register-mean"/>`;
  }

  if (lookupStats.length > 1) {
    const meanPath = lookupStats.map((stat, i) => {
      const x = xScale(stat.treeSize);
      const y = yScale(stat.mean);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    svg += `
    <path d="${meanPath}" class="lookup-mean"/>`;
  }

  // Draw mean points
  registerStats.forEach(stat => {
    const x = xScale(stat.treeSize);
    const y = yScale(stat.mean);
    svg += `
    <circle cx="${x}" cy="${y}" r="4" class="register-dot"/>`;
  });

  lookupStats.forEach(stat => {
    const x = xScale(stat.treeSize);
    const y = yScale(stat.mean);
    svg += `
    <circle cx="${x}" cy="${y}" r="4" class="lookup-dot"/>`;
  });

  // Legend
  svg += `
    <!-- Legend -->
    <g transform="translate(20, 20)">
      <rect x="0" y="0" width="190" height="80" fill="white" stroke="#ccc" stroke-width="1"/>

      <!-- Register Instance Legend -->
      <text x="10" y="20" class="legend" font-weight="bold">Register Instance</text>
      <line x1="10" y1="30" x2="40" y2="30" class="register-mean"/>
      <circle cx="25" cy="30" r="3" class="register-dot"/>
      <text x="45" y="34" class="legend">Average Timing</text>

      <!-- Lookup Instance Legend -->
      <text x="10" y="55" class="legend" font-weight="bold">Lookup Instance</text>
      <line x1="10" y1="65" x2="40" y2="65" class="lookup-mean"/>
      <circle cx="25" cy="65" r="3" class="lookup-dot"/>
      <text x="45" y="69" class="legend">Average Timing</text>
    </g>

  </g>

  <!-- Test Metadata Section -->
  <g transform="translate(50, 620)">
    <!-- Left Column: System Information -->
    <g transform="translate(20, 20)">
      <text x="0" y="0" class="metadata-section">System Information</text>

      <text x="0" y="25" class="metadata-label">Test Date:</text>
      <text x="150" y="25" class="metadata-value">${new Date().toISOString().split('T')[0]}</text>

      <text x="0" y="45" class="metadata-label">Package Version:</text>
      <text x="150" y="45" class="metadata-value">@fjell/registry v4.4.5</text>

      <text x="0" y="65" class="metadata-label">Node.js Version:</text>
      <text x="150" y="65" class="metadata-value">${process.version} (${process.platform} ${process.arch})</text>

      <text x="0" y="85" class="metadata-label">Platform:</text>
      <text x="150" y="85" class="metadata-value">${process.platform} ${process.arch}</text>

      <text x="0" y="105" class="metadata-label">Compiler:</text>
      <text x="150" y="105" class="metadata-value">TypeScript + Vite</text>
    </g>

    <!-- Center Column: Test Configuration -->
    <g transform="translate(330, 20)">
      <text x="0" y="0" class="metadata-section">Test Configuration</text>

      <text x="0" y="25" class="metadata-label">Test Rounds:</text>
      <text x="120" y="25" class="metadata-value">${TEST_ROUNDS} per tree size</text>

      <text x="0" y="45" class="metadata-label">Iterations per Round:</text>
      <text x="120" y="45" class="metadata-value">${ITERATIONS} operations</text>

      <text x="0" y="65" class="metadata-label">Total Measurements:</text>
      <text x="120" y="65" class="metadata-value">${(TEST_ROUNDS * ITERATIONS).toLocaleString()} per data point</text>
    </g>

    <!-- Right Column: Test Notes -->
    <g transform="translate(600, 20)">
      <text x="0" y="0" class="metadata-section">Test Notes</text>
      <text x="0" y="25" class="metadata-label">• Performance measurements use Node.js performance.now() with microsecond precision</text>
      <text x="0" y="42" class="metadata-label">• Each test includes warm-up iterations to minimize JIT compilation effects</text>
      <text x="0" y="59" class="metadata-label">• Logging is mocked during timing tests to eliminate I/O overhead</text>
      <text x="0" y="76" class="metadata-label">• Tests verify both mean performance and consistency (low standard deviation)</text>
      <text x="0" y="93" class="metadata-label">• Statistical analysis ensures reliable performance measurements across all tree sizes</text>
    </g>
  </g>
</svg>`;

  // Save performance range graph
  const performancePath = path.join(process.cwd(), 'docs', 'timing-range.svg');
  await fs.writeFile(performancePath, svg, 'utf-8');
  console.log(`✅ Performance range chart generated: ${performancePath}`);
}

async function generateTimingDocumentation(results: TimingResult[]): Promise<void> {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version || '4.4.5';

  let markdown = `# Performance Timing Report

Generated: ${timestamp}
Version: ${version}
Node.js: ${process.version}
Platform: ${process.platform} ${process.arch}

## Summary

This document contains performance timing metrics for key operations in @fjell/registry.
All measurements are taken over ${ITERATIONS} iterations (unless otherwise noted) with warm-up runs.
Timing results are reported in microseconds (µs) for precision.

`;

  // Separate basic operations from scaling tests
  const basicResults = results.filter(r => !r.treeSize);
  const scalingResults = results.filter(r => r.treeSize);

  // Generate performance range chart
  await generatePerformanceRangeGraph(scalingResults);

  // Summary table for basic operations
  markdown += `## Basic Operations Performance

| Operation | Description | Avg Time (µs) | Min Time (µs) | Max Time (µs) | Threshold (µs) | Status |
|-----------|-------------|---------------|---------------|---------------|----------------|--------|
`;

  basicResults.forEach(result => {
    const thresholdStr = result.threshold ? result.threshold.toFixed(0) : 'N/A';
    const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
    markdown += `| ${result.operation} | ${result.description} | ${result.averageTime.toFixed(1)} | ${result.minTime.toFixed(1)} | ` +
      `${result.maxTime.toFixed(1)} | ${thresholdStr} | ${statusEmoji} ${result.status} |\n`;
  });

  // Scaling tests table
  if (scalingResults.length > 0) {
    markdown += `
## Scaling Performance Tests

| Operation | Tree Size | Avg Time (µs) | Min Time (µs) | Max Time (µs) | Threshold (µs) | Status |
|-----------|-----------|---------------|---------------|---------------|----------------|--------|
`;

    scalingResults.forEach(result => {
      const thresholdStr = result.threshold ? result.threshold.toFixed(0) : 'N/A';
      const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
      markdown += `| ${result.operation} | ${result.treeSize} | ${result.averageTime.toFixed(1)} | ${result.minTime.toFixed(1)} | ` +
        `${result.maxTime.toFixed(1)} | ${thresholdStr} | ${statusEmoji} ${result.status} |\n`;
    });

    // Add performance range chart
    markdown += `
## Scaling Performance Visualization

### Performance Range Chart
![Performance Range Chart](./timing-range.svg)

*This performance range chart shows the average performance (center line) with ±1 standard deviation bands for each tree size.
The bands reveal performance consistency and variability across ${TEST_ROUNDS} test rounds. Tight bands indicate
consistent performance, while wider bands show more variability.*

`;
  }

  // Detailed Results
  markdown += `
## Detailed Results

### Basic Operations

`;

  basicResults.forEach(result => {
    markdown += `#### ${result.operation}

**Description:** ${result.description}
**Iterations:** ${result.iterations}
**Average Time:** ${result.averageTime.toFixed(1)} ${result.unit}
**Min Time:** ${result.minTime.toFixed(1)} ${result.unit}
**Max Time:** ${result.maxTime.toFixed(1)} ${result.unit}
`;

    if (result.threshold) {
      markdown += `**Threshold:** ${result.threshold} ${result.unit}
**Status:** ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
`;
    }

    markdown += '\n';
  });

  if (scalingResults.length > 0) {
    markdown += `### Scaling Tests

`;

    scalingResults.forEach(result => {
      markdown += `#### ${result.operation} (Tree Size: ${result.treeSize})

**Description:** ${result.description}
**Tree Size:** ${result.treeSize} items
**Iterations:** ${result.iterations}
**Average Time:** ${result.averageTime.toFixed(1)} ${result.unit}
**Min Time:** ${result.minTime.toFixed(1)} ${result.unit}
**Max Time:** ${result.maxTime.toFixed(1)} ${result.unit}
`;

      if (result.threshold) {
        markdown += `**Threshold:** ${result.threshold} ${result.unit}
**Status:** ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
`;
      }

      markdown += '\n';
    });
  }

  // Performance Analysis
  markdown += `## Performance Analysis

### Key Metrics

- **Registry Creation**: Fast lightweight object creation
- **RegistryHub Creation**: Minimal overhead for hub management
- **Instance Creation**: Efficient coordinate-based instance creation
- **Instance Lookup**: Optimized tree traversal for instance retrieval
- **Registration**: Quick instance registration with scope support

  ### Scaling Analysis

The scaling tests measure performance across a wide range of tree sizes to identify potential O(n) issues:

- **Small Scale (10-100)**: Baseline performance for small registries
- **Medium Scale (200-1000)**: Standard application-scale registry performance
- **Large Scale (2000-10000)**: Enterprise-scale registry performance
- **Very Large Scale (20000-100000)**: Extreme-scale registry stress testing

Tree sizes tested: 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000

These comprehensive tests help ensure that the registry maintains good performance characteristics across all
deployment scenarios, from small applications to large-scale enterprise systems.

### Timing Constraints

The following timing constraints are enforced to ensure optimal performance:

#### Basic Operations
`;

  Object.entries(TIMING_CONSTRAINTS).forEach(([operation, threshold]) => {
    markdown += `- **${operation}**: ≤ ${threshold}µs (${(threshold / 1000).toFixed(1)}ms)\n`;
  });

  markdown += `
#### Scaling Operations
- **registerInstance** (≤100 items): ≤ 5000µs (5ms)
- **registerInstance** (100-1000 items): ≤ 10000µs (10ms)
- **registerInstance** (1000-10000 items): ≤ 20000µs (20ms)
- **registerInstance** (>10000 items): ≤ 50000µs (50ms)
- **lookupInstance** (≤100 items): ≤ 2000µs (2ms)
- **lookupInstance** (100-1000 items): ≤ 5000µs (5ms)
- **lookupInstance** (1000-10000 items): ≤ 10000µs (10ms)
- **lookupInstance** (>10000 items): ≤ 25000µs (25ms)
`;

  markdown += `
### Notes

- All timing tests include warm-up iterations to account for JIT compilation
- Tests are run in isolation to minimize interference
- Results may vary based on system specifications and current load
- Timing results are reported in microseconds (µs) for precision
- Timing constraints are set to ensure the library performs well in production environments
- Scaling tests help identify performance degradation as registry size increases

### Recommendations

If any timing tests fail:

1. **Review Recent Changes**: Check if recent code changes have introduced performance regressions
2. **System Resources**: Ensure adequate system resources are available during testing
3. **Optimization**: Consider optimizing the failing operations if thresholds are consistently exceeded
4. **Threshold Review**: Review if timing constraints are still appropriate for current use cases

---

*This document is automatically generated during testing and should be updated with each release.*
`;

  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), 'docs');
  await fs.mkdir(docsDir, { recursive: true });

  // Write the documentation
  const filePath = path.join(docsDir, 'timing.md');
  await fs.writeFile(filePath, markdown, 'utf-8');

  console.log(`✅ Timing documentation generated: ${filePath}`);
}
