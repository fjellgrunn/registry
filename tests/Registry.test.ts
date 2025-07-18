import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Instance } from '@/Instance';
import { createRegistry, Registry } from '@/Registry';
import { Coordinate } from '@/Coordinate';

vi.mock('@/logger', () => {
  const logger = {
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
  };

  return {
    default: {
      get: vi.fn(() => logger),
    }
  }
});

describe('LibRegistry', () => {
  let registry: Registry;

  beforeEach(() => {
    registry = createRegistry();
    vi.clearAllMocks();
  });

  it('should register a library', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['testLib'], lib);
    expect(registry.get(['testLib'])).toBe(lib);
  });

  it('should return undefined for unregistered library', () => {
    expect(() => registry.get(['nonExistentLib'])).toThrow();
  });

  it('should register and retrieve library with multi-element key array', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['test', 'nested', 'lib'], lib);
    expect(registry.get(['test', 'nested', 'lib'])).toBe(lib);
  });

  it('should return undefined when partial key array match', () => {
    const lib = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    registry.register(['test', 'nested', 'lib'], lib);
    expect(() => registry.get(['test', 'nested'])).toThrow();
  });

  it('should handle multiple libraries with different key arrays', () => {
    const lib1 = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const lib2 = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['test', 'lib1'], lib1);
    registry.register(['test', 'lib2'], lib2);

    expect(registry.get(['test', 'lib1'])).toBe(lib1);
    expect(registry.get(['test', 'lib2'])).toBe(lib2);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);
    registry.register(['element', 'container', 'region', 'nation'], element);

    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
    expect(registry.get(['nation'])).toBe(nation);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const element = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['element', 'container', 'region', 'nation'], element);
    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation'])).toBe(element);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

  it('should handle multiple libraries with different scopes', () => {
    const nationDefault = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nationFirestore = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nationSequelize = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['nation'], nationDefault);
    registry.register(['nation'], nationFirestore, { scopes: ['firestore'] });
    registry.register(['nation'], nationSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nationDefault);
    expect(registry.get(['nation'], { scopes: ['firestore'] })).toBe(nationFirestore);
    expect(registry.get(['nation'], { scopes: ['sequelize'] })).toBe(nationSequelize);
  });

  it('should handle multiple libraries with very different key arrays', () => {
    const elementFirestore1 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelize1 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelize2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementFirestore2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const elementSequelizeBlamo2 =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const container = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const containerFirestore =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const containerSequelize =
      {
        coordinate: {} as Coordinate<'test'>,
        registry: {} as Registry,
      } as unknown as Instance<'test'>;
    const region = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;
    const nation = {
      coordinate: {} as Coordinate<'test'>,
      registry: {} as Registry,
    } as unknown as Instance<'test'>;

    registry.register(['element', 'container', 'region', 'nation'], elementFirestore1, { scopes: ['firestore'] });
    registry.register(['element', 'container', 'region', 'nation'], elementSequelize1, { scopes: ['sequelize'] });
    registry.register(['element2', 'container', 'region', 'nation'], elementSequelize2, { scopes: ['sequelize'] });
    registry.register(['element2', 'container', 'region', 'nation'], elementFirestore2, { scopes: ['firestore'] });
    registry.register(['element2', 'container', 'region', 'nation'],
      elementSequelizeBlamo2, { scopes: ['sequelize', 'blamo'] });
    registry.register(['nation'], nation);
    registry.register(['region', 'nation'], region);
    registry.register(['container', 'region', 'nation'], container);
    registry.register(['container', 'region', 'nation'], containerFirestore, { scopes: ['firestore'] });
    registry.register(['container', 'region', 'nation'], containerSequelize, { scopes: ['sequelize'] });

    expect(registry.get(['nation'])).toBe(nation);
    expect(registry.get(['element', 'container', 'region', 'nation']))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize1);
    expect(() => registry.get(['element', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toThrow();
    expect(registry.get(['element2', 'container', 'region', 'nation']))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['firestore'] }))
      .toBe(elementFirestore2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize'] }))
      .toBe(elementSequelize2);
    expect(registry.get(['element2', 'container', 'region', 'nation'], { scopes: ['sequelize', 'blamo'] }))
      .toBe(elementSequelizeBlamo2);
    expect(registry.get(['container', 'region', 'nation'])).toBe(container);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['firestore'] })).toBe(containerFirestore);
    expect(registry.get(['container', 'region', 'nation'], { scopes: ['sequelize'] })).toBe(containerSequelize);
    expect(registry.get(['region', 'nation'])).toBe(region);
  });

});
