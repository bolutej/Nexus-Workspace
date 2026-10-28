
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

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
