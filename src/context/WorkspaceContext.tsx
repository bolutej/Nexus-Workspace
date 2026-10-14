
import {
  createContext,
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

interface WorkspaceContextValue {
  state: WorkspaceState;
  dispatch: Dispatch<WorkspaceAction>;
}

export const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({
  children,
}: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(
    workspaceReducer,
    initialWorkspaceState
  );

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
