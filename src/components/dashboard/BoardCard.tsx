import { Link } from "react-router-dom";
import { memo } from "react";
import type { Board } from "../../types/workspace";
import { useWorkspace } from "../../hooks/useWorkspace";

interface BoardCardProps {
  board: Board;
}

function BoardCardComponent({ board }: BoardCardProps) {
  const { dispatch } = useWorkspace();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${board.title}"? Its columns and cards will also be deleted.`
    );

    if (!confirmed) return;

    dispatch({
      type: "BOARD_DELETED",
      payload: { boardId: board.id },
    });
  }

  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(board.createdAt));

  return (
    <article className="board-card">
      <div className="board-card__content">
        <h2 className="board-card__title">
  <Link className="board-card__link" to={`/boards/${board.id}`}>
    {board.title}
  </Link>
</h2>
        <p className="board-card__description">
          {board.description || "No description provided."}
        </p>

        <p className="board-card__date">
          Created {formattedDate}
        </p>
      </div>

      <button
        type="button"
        className="button button--danger"
        onClick={handleDelete}
        aria-label={`Delete board ${board.title}`}
      >
        Delete
      </button>
    </article>
  );
}

export const BoardCard = memo(BoardCardComponent);
