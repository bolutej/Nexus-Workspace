
import type {
  Board,
  BoardColumn,
  TaskCard,
  BoardId,
  ColumnId,
  CardId,
} from "../types/workspace";

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
  | { type: "CARD_DELETED"; payload: { cardId: CardId } };
