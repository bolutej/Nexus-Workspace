
import type { WorkspaceState } from "../types/workspace";

const STORAGE_KEY = "orbit-workspace-state";

export function loadWorkspace(): WorkspaceState | null {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return null;
    }

    return JSON.parse(savedData) as WorkspaceState;
  } catch (error) {
    console.error("Could not load workspace data:", error);
    return null;
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save workspace data:", error);
  }
}
