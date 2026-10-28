
import type { WorkspaceState } from "../types/workspace";
import { loadWorkspace, saveWorkspace } from "../utils/workspaceStorage";

/**
 * Mock API for workspace persistence.
 *
 * This currently uses localStorage as its backing store.
 * Later, these functions can be replaced with HTTP requests
 * without changing the components that call them.
 */

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 200);
  });
}

export const workspaceApi = {
  async getWorkspace(): Promise<WorkspaceState | null> {
    await simulateNetworkDelay();
    return loadWorkspace();
  },

  async saveWorkspace(state: WorkspaceState): Promise<void> {
    await simulateNetworkDelay();
    saveWorkspace(state);
  },
};
