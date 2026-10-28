
import {
  createContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import {
  initialWorkspaceState,
  workspaceReducer,
} from "../state/workspaceReducer";

import type { WorkspaceState } from "../types/workspace";
import type { WorkspaceAction } from "../state/workspaceActions";

import { loadWorkspace } from "../utils/workspaceStorage";
import { workspaceApi } from "../api/workspaceApi";
import {
  workspaceSync,
  workspaceSyncClientId,
} from "../api/workspaceSync";

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

interface WorkspaceProviderProps {
  children: ReactNode;
}

function getInitialWorkspaceState(): WorkspaceState {
  return loadWorkspace() ?? initialWorkspaceState;
}

export function WorkspaceProvider({
  children,
}: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(
    workspaceReducer,
    undefined,
    getInitialWorkspaceState
  );

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
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
