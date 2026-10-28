
import type {
  Board,
  BoardColumn,
  TaskCard,
  BoardId,
  ColumnId,
  CardId,
} from "../types/workspace";
import type { CommentId, TaskComment } from "../types/comments";
export type WorkspaceAction =
  | { type: "BOARD_CREATED"; payload: Board }
  | { type: "BOARD_DELETED"; payload: { boardId: BoardId } }
  | {
      type: "BOARD_UPDATED";
      payload: { boardId: BoardId; title: string; description: string };
    }
  | { type: "COLUMN_CREATED"; payload: BoardColumn }
  | {
      type: "COLUMN_UPDATED";
      payload: { columnId: ColumnId; title: string };
    }
  | { type: "COLUMN_DELETED"; payload: { columnId: ColumnId } }
  | { type: "CARD_CREATED"; payload: TaskCard }
  | { type: "CARD_UPDATED"; payload: TaskCard }
  | { type: "CARD_DELETED"; payload: { cardId: CardId } }
  | { type: "CARD_MOVED"; payload: { cardId: CardId; destinationColumnId: ColumnId; destinationIndex: number; } }
| {
    type: "REMOTE_EVENT_APPLIED";
    payload: {
      eventId: string;
      event:
        | {
            type: "CARD_CREATED";
            payload: TaskCard;
          }
        | {
            type: "CARD_MOVED";
            payload: {
              cardId: CardId;
              destinationColumnId: ColumnId;
              destinationIndex: number;
            };
          };
      timestamp: number;
      sequence: number;
      clientId: string;
    };
  }
  | {
    type: "LOCAL_CARD_MOVE_VERSION_RECORDED";
    payload: {
      cardId: CardId;
      timestamp: number;
      sequence: number;
      clientId: string;
    };
  }
  | {
    type: "COMMENT_CREATED";
    payload: {
      comment: TaskComment;
    };
  }
| {
    type: "COMMENT_UPDATED";
    payload: {
      commentId: CommentId;
      content: string;
    };
  }
| {
    type: "COMMENT_DELETED";
    payload: {
      commentId: CommentId;
    };
  }
| { type: "UNDO" }
| { type: "REDO" }