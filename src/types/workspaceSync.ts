
import type { TaskCard } from "./workspace";

export type WorkspaceSyncEvent =
  | {
      type: "CARD_CREATED";
      card: TaskCard;
      version: number;
      sequence: number;
      clientId: string;
      timestamp: number;
    }
  | {
      type: "CARD_MOVED";
      cardId: string;
      destinationColumnId: string;
      destinationIndex: number;
      version: number;
      sequence: number;
      clientId: string;
      timestamp: number;
    };

export interface WorkspaceSyncMessage {
  event: WorkspaceSyncEvent;
}
