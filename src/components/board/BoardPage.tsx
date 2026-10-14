
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { useWorkspace } from "../../hooks/useWorkspace";

export default function BoardPage() {
  const { boardId } = useParams();
  const { state, dispatch } = useWorkspace();

  const [columnTitle, setColumnTitle] = useState("");
  const [error, setError] = useState("");

  const board = boardId ? state.boards[boardId] : undefined;

  if (!board) {
    return (
      <main className="board-page">
        <h1>Board not found</h1>
        <p>This board may have been deleted or the URL is incorrect.</p>
        <Link to="/">Back to dashboard</Link>
      </main>
    );
  }

  const columns = board.columnIds
    .map((id) => state.columns[id])
    .filter((column) => column !== undefined);

  function handleCreateColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = columnTitle.trim();

    if (!cleanTitle) {
      setError("Enter a column name.");
      return;
    }

    dispatch({
      type: "COLUMN_CREATED",
      payload: {
        id: crypto.randomUUID(),
        boardId: boardId!,
        title: cleanTitle,
        cardIds: [],
      },
    });

    setColumnTitle("");
    setError("");
  }

  function handleRenameColumn(columnId: string, currentTitle: string) {
    const newTitle = window.prompt("Enter a new column name:", currentTitle);

    if (newTitle === null) return;

    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      window.alert("The column name cannot be empty.");
      return;
    }

    dispatch({
      type: "COLUMN_UPDATED",
      payload: { columnId, title: cleanTitle },
    });
  }

  function handleDeleteColumn(columnId: string, title: string) {
    const confirmed = window.confirm(
      `Delete "${title}" and all its cards?`
    );

    if (!confirmed) return;

    dispatch({
      type: "COLUMN_DELETED",
      payload: { columnId },
    });
  }

  return (
    <main className="board-page">
      <nav className="board-page__nav" aria-label="Breadcrumb">
        <Link to="/">← All boards</Link>
      </nav>

      <header className="board-page__header">
        <div>
          <p className="dashboard__eyebrow">WORKSPACE BOARD</p>
          <h1>{board.title}</h1>
          <p className="board-page__description">
            {board.description || "No description provided."}
          </p>
        </div>
      </header>

      <section aria-labelledby="columns-heading">
        <h2 id="columns-heading">Columns</h2>

        <form className="column-form" onSubmit={handleCreateColumn}>
          <label htmlFor="column-title">New column name</label>

          <div className="column-form__controls">
            <input
              id="column-title"
              value={columnTitle}
              onChange={(event) => {
                setColumnTitle(event.target.value);
                setError("");
              }}
              placeholder="e.g. To Do"
              maxLength={80}
              required
            />

            <button className="button button--primary" type="submit">
              Add column
            </button>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
        </form>

        {columns.length === 0 ? (
          <div className="empty-state">
            <h3>No columns yet</h3>
            <p>Add a column to start organizing this board.</p>
          </div>
        ) : (
          <div className="columns-grid">
            {columns.map((column) => (
              <article className="column-card" key={column.id}>
                <div className="column-card__heading">
                  <h3>{column.title}</h3>
                  <span>{column.cardIds.length} cards</span>
                </div>

                <div className="column-card__actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() =>
                      handleRenameColumn(column.id, column.title)
                    }
                    aria-label={`Rename ${column.title} column`}
                  >
                    Rename
                  </button>

                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() =>
                      handleDeleteColumn(column.id, column.title)
                    }
                    aria-label={`Delete ${column.title} column`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
