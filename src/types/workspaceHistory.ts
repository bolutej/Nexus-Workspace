
import type { WorkspaceState } from "./workspace";

export interface WorkspaceHistory {
  past: WorkspaceState[];
  future: WorkspaceState[];
}

export const MAX_HISTORY = 50;

export const initialWorkspaceHistory: WorkspaceHistory = {
  past: [],
  future: [],
};
