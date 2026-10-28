export type CommentId = string;

export interface TaskComment {
  id: CommentId;
  cardId: string;
  parentId: CommentId | null;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentState {
  comments: Record<CommentId, TaskComment>;
  commentIdsByCard: Record<string, CommentId[]>;
}