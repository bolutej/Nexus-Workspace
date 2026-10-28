
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { WorkspaceState } from "../types/workspace";
import type { WorkspaceAction } from "../state/workspaceActions";

import {
  initialWorkspaceState,
} from "../state/workspaceReducer";

import {
  initialWorkspaceHistoryState,
  workspaceHistoryReducer,
} from "../state/workspaceHistoryReducer";

import { loadWorkspace } from "../utils/workspaceStorage";
import { workspaceApi } from "../api/workspaceApi";

import {
  workspaceSync,
  workspaceSyncClientId,
} from "../api/workspaceSync";

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
  canUndo: boolean;
  canRedo: boolean;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used within a WorkspaceProvider"
    );
  }

  return context;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

function getInitialWorkspaceState(): WorkspaceState {
  const savedState = loadWorkspace() ?? initialWorkspaceState;

  return {
    ...savedState,
    comments: savedState.comments ?? {},
    commentIdsByCard: savedState.commentIdsByCard ?? {},
    cardMoveVersions: savedState.cardMoveVersions ?? {},
    processedEventIds: savedState.processedEventIds ?? [],
  };
}

export function WorkspaceProvider({
  children,
}: WorkspaceProviderProps) {
  const [historyState, dispatch] = useReducer(
    workspaceHistoryReducer,
    undefined,
    () => ({
      ...initialWorkspaceHistoryState,
      workspace: getInitialWorkspaceState(),
    })
  );

  const { workspace: state, history } = historyState;

  useEffect(() => {
    void workspaceApi.saveWorkspace(state);
  }, [state]);

  useEffect(() => {
    const unsubscribe = workspaceSync.subscribe((event) => {
      if (event.clientId === workspaceSyncClientId) {
        return;
      }

      if (event.type === "CARD_CREATED") {
        dispatch({
          type: "REMOTE_EVENT_APPLIED",
          payload: {
            eventId: `${event.clientId}-${event.version}`,
            timestamp: event.timestamp,
            sequence: event.sequence,
            clientId: event.clientId,
            event: {
              type: "CARD_CREATED",
              payload: event.card,
            },
          },
        });

        return;
      }

      if (event.type === "CARD_MOVED") {
        dispatch({
          type: "REMOTE_EVENT_APPLIED",
          payload: {
            eventId: `${event.clientId}-${event.version}`,
            timestamp: event.timestamp,
            sequence: event.sequence,
            clientId: event.clientId,
            event: {
              type: "CARD_MOVED",
              payload: {
                cardId: event.cardId,
                destinationColumnId: event.destinationColumnId,
                destinationIndex: event.destinationIndex,
              },
            },
          },
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        dispatch,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
