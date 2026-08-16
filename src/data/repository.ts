import { createInMemoryRepository } from './in-memory-repository';
import type { DiscoveryRepository } from './discovery-repository';

/**
 * The one repository instance the app uses.
 *
 * It has to be a module-level singleton rather than something a screen creates,
 * because the in-memory implementation keeps its discoveries in a closure —
 * creating a second one would silently give that screen a different, stale copy
 * of the data.
 *
 * When persistence arrives, this is the line that changes, and nothing else.
 */
export const repository: DiscoveryRepository = createInMemoryRepository();
