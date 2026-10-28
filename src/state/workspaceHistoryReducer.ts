
import type { WorkspaceState } from "../types/workspace";
import type { WorkspaceAction } from "./workspaceActions";
import {
  initialWorkspaceState,
  workspaceReducer,
} from "./workspaceReducer";
import {
  initialWorkspaceHistory,
  MAX_HISTORY,
  type WorkspaceHistory,
} from "../types/workspaceHistory";

export interface WorkspaceHistoryState {
  workspace: WorkspaceState;
  history: WorkspaceHistory;
}

export const initialWorkspaceHistoryState: WorkspaceHistoryState = {
  workspace: initialWorkspaceState,
  history: initialWorkspaceHistory,
};


const nonUndoableActions = new Set<string>([
  "UNDO",
  "REDO",
  "REMOTE_EVENT_APPLIED",
  "LOCAL_CARD_MOVE_VERSION_RECORDED",
]);

export function workspaceHistoryReducer(
  state: WorkspaceHistoryState,
  action: WorkspaceAction
): WorkspaceHistoryState {
  if (action.type === "UNDO") {
    const previous = state.history.past.at(-1);

    if (!previous) return state;

    return {
      workspace: previous,
      history: {
        past: state.history.past.slice(0, -1),
        future: [state.workspace, ...state.history.future],
      },
    };
  }

  if (action.type === "REDO") {
    const next = state.history.future[0];

    if (!next) return state;

    return {
      workspace: next,
      history: {
        past: [...state.history.past, state.workspace].slice(
          -MAX_HISTORY
        ),
        future: state.history.future.slice(1),
      },
    };
  }

  const nextWorkspace = workspaceReducer(state.workspace, action);

  if (
    nextWorkspace === state.workspace ||
    nonUndoableActions.has(action.type)
  ) {
    return {
      ...state,
      workspace: nextWorkspace,
    };
  }

  return {
    workspace: nextWorkspace,
    history: {
      past: [...state.history.past, state.workspace].slice(
        -MAX_HISTORY
      ),
      future: [],
    },
  };
}
