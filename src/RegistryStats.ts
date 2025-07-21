/**
 * Represents a service client (another service making the request)
 */
export interface ServiceClient {
  /** The type of registry where the calling service is registered */
  registryType: string;
  /** The coordinate of the calling service */
  coordinate: {
    kta: string[];
    scopes: string[];
  };
}

/**
 * Represents either a service or application client
 */
export type ClientIdentifier = ServiceClient | string;

/**
 * Represents a specific coordinate call with both kta and scopes
 */
export interface CoordinateCallRecord {
  /** The key type array that was requested */
  kta: string[];
  /** The scopes that were requested (empty array if no scopes) */
  scopes: string[];
  /** Number of times this exact combination was called */
  count: number;
  /** Breakdown of calls by client */
  clientCalls: ClientCallRecord[];
}

/**
 * Represents calls from a specific client
 */
export interface ClientCallRecord {
  /** The client that made the calls */
  client: ClientIdentifier;
  /** Number of calls from this client */
  count: number;
}

/**
 * Statistics about Registry get() method calls with detailed coordinate tracking
 */
export interface RegistryStatistics {
  /** Total number of get() calls made on this registry */
  totalGetCalls: number;
  /** Detailed records of each unique coordinate combination and their call counts */
  coordinateCallRecords: CoordinateCallRecord[];
  /** Summary of calls by client type */
  clientSummary: {
    /** Total calls from services (service-to-service) */
    serviceCalls: number;
    /** Total calls from applications (direct application calls) */
    applicationCalls: number;
    /** Total calls with no client specified */
    unidentifiedCalls: number;
  };
}

/**
 * Internal class for tracking Registry statistics with complex coordinate combinations and client tracking
 */
export class RegistryStats {
  private totalCalls = 0;
  // Map structure: ktaKey -> scopeKey -> clientKey -> count
  private coordinateCalls = new Map<string, Map<string, Map<string, number>>>();

  /**
   * Records a get() call for the specified coordinate and client
   */
  recordGetCall(kta: string[], scopes?: string[], client?: ClientIdentifier): void {
    this.totalCalls++;

    const ktaKey = kta.join('.');
    const scopeKey = this.createScopeKey(scopes || []);
    const clientKey = this.createClientKey(client);

    if (!this.coordinateCalls.has(ktaKey)) {
      this.coordinateCalls.set(ktaKey, new Map());
    }

    const scopeMap = this.coordinateCalls.get(ktaKey)!;
    if (!scopeMap.has(scopeKey)) {
      scopeMap.set(scopeKey, new Map());
    }

    const clientMap = scopeMap.get(scopeKey)!;
    const currentCount = clientMap.get(clientKey) || 0;
    clientMap.set(clientKey, currentCount + 1);
  }

  /**
   * Gets the current statistics snapshot
   */
  getStatistics(): RegistryStatistics {
    const coordinateCallRecords: CoordinateCallRecord[] = [];
    let serviceCalls = 0;
    let applicationCalls = 0;
    let unidentifiedCalls = 0;

    for (const [ktaKey, scopeMap] of this.coordinateCalls) {
      for (const [scopeKey, clientMap] of scopeMap) {
        const clientCalls: ClientCallRecord[] = [];
        let totalCount = 0;

        for (const [clientKey, count] of clientMap) {
          const client = this.parseClientKey(clientKey);
          if (client !== null) {
            clientCalls.push({ client, count });
          }
          totalCount += count;

          // Update client summary
          if (clientKey === '__no_client__') {
            unidentifiedCalls += count;
          } else if (typeof client === 'string') {
            applicationCalls += count;
          } else if (client !== null) {
            serviceCalls += count;
          }
        }

        coordinateCallRecords.push({
          kta: ktaKey.split('.'),
          scopes: this.parseScopeKey(scopeKey),
          count: totalCount,
          clientCalls: [...clientCalls] // Return a copy
        });
      }
    }

    return {
      totalGetCalls: this.totalCalls,
      coordinateCallRecords: [...coordinateCallRecords], // Return a copy
      clientSummary: {
        serviceCalls,
        applicationCalls,
        unidentifiedCalls
      }
    };
  }

  /**
   * Gets call count for a specific coordinate combination
   */
  getCallCount(kta: string[], scopes?: string[]): number {
    const ktaKey = kta.join('.');
    const scopeKey = this.createScopeKey(scopes || []);

    const scopeMap = this.coordinateCalls.get(ktaKey);
    if (!scopeMap) return 0;

    const clientMap = scopeMap.get(scopeKey);
    if (!clientMap) return 0;

    let total = 0;
    for (const count of clientMap.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Gets call count for a specific coordinate combination from a specific client
   */
  getCallCountByClient(kta: string[], scopes?: string[], client?: ClientIdentifier): number {
    const ktaKey = kta.join('.');
    const scopeKey = this.createScopeKey(scopes || []);
    const clientKey = this.createClientKey(client);

    const scopeMap = this.coordinateCalls.get(ktaKey);
    if (!scopeMap) return 0;

    const clientMap = scopeMap.get(scopeKey);
    if (!clientMap) return 0;

    return clientMap.get(clientKey) || 0;
  }

  /**
   * Gets total calls for a specific kta (across all scopes)
   */
  getTotalCallsForKta(kta: string[]): number {
    const ktaKey = kta.join('.');
    const scopeMap = this.coordinateCalls.get(ktaKey);
    if (!scopeMap) return 0;

    let total = 0;
    for (const clientMap of scopeMap.values()) {
      for (const count of clientMap.values()) {
        total += count;
      }
    }
    return total;
  }

  /**
   * Gets all unique kta paths that have been called
   */
  getCalledKtaPaths(): string[][] {
    const ktaPaths: string[][] = [];
    for (const ktaKey of this.coordinateCalls.keys()) {
      ktaPaths.push(ktaKey.split('.'));
    }
    return ktaPaths;
  }

  /**
   * Creates a normalized scope key from scopes array
   */
  private createScopeKey(scopes: string[]): string {
    if (scopes.length === 0) return '__no_scopes__';
    return [...scopes].sort().join(',');
  }

  /**
   * Parses a scope key back to scopes array
   */
  private parseScopeKey(scopeKey: string): string[] {
    if (scopeKey === '__no_scopes__') return [];
    return scopeKey.split(',');
  }

  /**
   * Creates a normalized client key from client identifier
   */
  private createClientKey(client?: ClientIdentifier): string {
    if (!client) return '__no_client__';

    if (typeof client === 'string') {
      return `app:${client}`;
    }

    // Service client
    const coordKey = `${client.coordinate.kta.join('.')};${this.createScopeKey(client.coordinate.scopes)}`;
    return `service:${client.registryType}:${coordKey}`;
  }

  /**
   * Parses a client key back to client identifier
   */
  private parseClientKey(clientKey: string): ClientIdentifier | null {
    if (clientKey === '__no_client__') return null;

    if (clientKey.startsWith('app:')) {
      return clientKey.substring(4);
    }

    if (clientKey.startsWith('service:')) {
      const parts = clientKey.substring(8).split(':');
      if (parts.length !== 2) return null;

      const registryType = parts[0];
      const coordParts = parts[1].split(';');
      if (coordParts.length !== 2) return null;

      const kta = coordParts[0].split('.');
      const scopes = this.parseScopeKey(coordParts[1]);

      return {
        registryType,
        coordinate: { kta, scopes }
      };
    }

    return null;
  }
}
