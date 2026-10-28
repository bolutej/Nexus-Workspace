import type { CommentId, TaskComment } from "./comments";export type BoardId = string;

export type ColumnId = string;
export type CardId = string;

export interface Board {
    id: BoardId;
    title: string;
    description: string;
    createdAt: string;
    columnIds: ColumnId[];
}

export interface BoardColumn {
    id: ColumnId;
    boardId: BoardId;
    title: string;
    cardIds: CardId[];
}

export interface TaskCard {
    id: CardId;
    columnId: ColumnId;
    title: string;
    description: string;
    tags: string[];
    dueDate: string | null;
}

export interface WorkspaceState {
  boards: Record<BoardId, Board>;
  columns: Record<ColumnId, BoardColumn>;
  cards: Record<CardId, TaskCard>;
  processedEventIds?: string[];

  cardMoveVersions?: Record<
    CardId,
    {
      timestamp: number;
      sequence: number;
      clientId: string;
    }
  >;
  comments: Record<CommentId, TaskComment>;
commentIdsByCard: Record<string, CommentId[]>;
}