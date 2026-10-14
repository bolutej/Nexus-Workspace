
import type { WorkspaceState } from "../types/workspace";
import type { WorkspaceAction } from "./workspaceActions";

export const initialWorkspaceState: WorkspaceState = {
  boards: {},
  columns: {},
  cards: {},
};

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case "BOARD_CREATED": {
      const board = action.payload;

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: board,
        },
      };
    }

    case "BOARD_UPDATED": {
      const { boardId, title, description } = action.payload;
      const board = state.boards[boardId];

      if (!board) return state;

      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            title,
            description,
          },
        },
      };
    }

    case "BOARD_DELETED": {
      const { boardId } = action.payload;
      const board = state.boards[boardId];

      if (!board) return state;

      const nextBoards = { ...state.boards };
      const nextColumns = { ...state.columns };
      const nextCards = { ...state.cards };

      delete nextBoards[boardId];

      for (const columnId of board.columnIds) {
        const column = nextColumns[columnId];

        if (!column) continue;

        for (const cardId of column.cardIds) {
          delete nextCards[cardId];
        }

        delete nextColumns[columnId];
      }

      return {
        boards: nextBoards,
        columns: nextColumns,
        cards: nextCards,
      };
    }

    case "COLUMN_CREATED": {
      const column = action.payload;
      const board = state.boards[column.boardId];

      if (!board) return state;

      return {
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnIds: [...board.columnIds, column.id],
          },
        },
        columns: {
          ...state.columns,
          [column.id]: column,
        },
      };
    }

    case "COLUMN_UPDATED": {
      const { columnId, title } = action.payload;
      const column = state.columns[columnId];

      if (!column) return state;

      return {
        ...state,
        columns: {
          ...state.columns,
          [columnId]: {
            ...column,
            title,
          },
        },
      };
    }

    case "COLUMN_DELETED": {
      const { columnId } = action.payload;
      const column = state.columns[columnId];

      if (!column) return state;

      const board = state.boards[column.boardId];
      const nextColumns = { ...state.columns };
      const nextCards = { ...state.cards };

      delete nextColumns[columnId];

      for (const cardId of column.cardIds) {
        delete nextCards[cardId];
      }

      return {
        ...state,
        boards: board
          ? {
              ...state.boards,
              [board.id]: {
                ...board,
                columnIds: board.columnIds.filter(
                  (id) => id !== columnId
                ),
              },
            }
          : state.boards,
        columns: nextColumns,
        cards: nextCards,
      };
    }

    case "CARD_CREATED": {
      const card = action.payload;
      const column = state.columns[card.columnId];

      if (!column) return state;

      return {
        ...state,
        columns: {
          ...state.columns,
          [column.id]: {
            ...column,
            cardIds: [...column.cardIds, card.id],
          },
        },
        cards: {
          ...state.cards,
          [card.id]: card,
        },
      };
    }

    case "CARD_UPDATED": {
      const card = action.payload;
      const previousCard = state.cards[card.id];
      const destinationColumn = state.columns[card.columnId];

      if (!previousCard || !destinationColumn) return state;

      const sourceColumn = state.columns[previousCard.columnId];

      if (!sourceColumn) return state;

      if (previousCard.columnId === card.columnId) {
        return {
          ...state,
          cards: {
            ...state.cards,
            [card.id]: card,
          },
        };
      }

      return {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            cardIds: sourceColumn.cardIds.filter(
              (id) => id !== card.id
            ),
          },
          [destinationColumn.id]: {
            ...destinationColumn,
            cardIds: destinationColumn.cardIds.includes(card.id)
              ? destinationColumn.cardIds
              : [...destinationColumn.cardIds, card.id],
          },
        },
        cards: {
          ...state.cards,
          [card.id]: card,
        },
      };
    }

    case "CARD_DELETED": {
      const { cardId } = action.payload;
      const card = state.cards[cardId];

      if (!card) return state;

      const column = state.columns[card.columnId];
      const nextCards = { ...state.cards };

      delete nextCards[cardId];

      return {
        ...state,
        columns: column
          ? {
              ...state.columns,
              [column.id]: {
                ...column,
                cardIds: column.cardIds.filter(
                  (id) => id !== cardId
                ),
              },
            }
          : state.columns,
        cards: nextCards,
      };
    }

    default: {
      return state;
    }
  }
}
