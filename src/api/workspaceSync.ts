import type { WorkspaceSyncEvent } from "../types/workspaceSync";

export const workspaceSyncClientId = crypto.randomUUID();

type SyncListener = (event: WorkspaceSyncEvent) => void;

interface StoredSyncEvent {
  id: string;
  event: WorkspaceSyncEvent;
}

const STORAGE_PREFIX = "nexus-workspace-sync:";
const POLL_INTERVAL_MS = 1000;

const listeners = new Set<SyncListener>();
const processedEventIds = new Set<string>();

let pollingTimer: ReturnType<typeof setInterval> | null = null;

function readStoredEvents(): StoredSyncEvent[] {
  const events: StoredSyncEvent[] = [];

  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key?.startsWith(STORAGE_PREFIX)) continue;

      const rawValue = localStorage.getItem(key);

      if (!rawValue) continue;

      try {
        const storedEvent = JSON.parse(rawValue) as StoredSyncEvent;

        if (
          storedEvent.id &&
          storedEvent.event &&
          !processedEventIds.has(storedEvent.id)
        ) {
          events.push(storedEvent);
        }
      } catch {
        // Ignore malformed event records.
      }
    }
  } catch (error) {
    console.error("Could not read workspace sync events:", error);
  }

  return events.sort(
  (first, second) =>
    first.event.timestamp - second.event.timestamp ||
    first.event.sequence - second.event.sequence ||
    first.event.clientId.localeCompare(second.event.clientId) ||
    first.id.localeCompare(second.id)
);
}

function pollForEvents(): void {
  for (const storedEvent of readStoredEvents()) {
    // Mark before notifying listeners to avoid reprocessing.
    processedEventIds.add(storedEvent.id);

    // Do not apply events created by this tab.
    if (storedEvent.event.clientId === workspaceSyncClientId) {
      continue;
    }

    listeners.forEach((listener) => {
      listener(storedEvent.event);
    });
  }
}

function startPolling(): void {
  if (pollingTimer !== null) return;

  pollForEvents();

  pollingTimer = setInterval(pollForEvents, POLL_INTERVAL_MS);
}

function stopPollingIfUnused(): void {
  if (listeners.size > 0 || pollingTimer === null) return;

  clearInterval(pollingTimer);
  pollingTimer = null;
}

export const workspaceSync = {
  subscribe(listener: SyncListener): () => void {
    listeners.add(listener);
    startPolling();

    return () => {
      listeners.delete(listener);
      stopPollingIfUnused();
    };
  },

  publish(event: WorkspaceSyncEvent): void {
    const id = `${event.clientId}:${event.version}`;
    const key = `${STORAGE_PREFIX}${id}`;

    // Prevent this tab from processing its own published event.
    processedEventIds.add(id);

    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          id,
          event,
        } satisfies StoredSyncEvent)
      );
    } catch (error) {
      console.error("Could not publish workspace sync event:", error);
    }

    // Preserve the existing in-memory event bus for local subscribers.
    listeners.forEach((listener) => {
      listener(event);
    });
  },
};
