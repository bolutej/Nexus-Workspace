
import { useState, type FormEvent } from "react";
import { BoardCard } from "./BoardCard";
import { useWorkspace } from "../../hooks/useWorkspace";

export function Dashboard() {
  const { state, dispatch } = useWorkspace();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError("Please enter a board title.");
      return;
    }

    const boardId = crypto.randomUUID();

    dispatch({
      type: "BOARD_CREATED",
      payload: {
        id: boardId,
        title: cleanTitle,
        description: cleanDescription,
        createdAt: new Date().toISOString(),
        columnIds: [],
      },
    });

    setTitle("");
    setDescription("");
    setError("");
  }

  const boards = Object.values(state.boards);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">YOUR WORKSPACE</p>
          <h1>Make room for great work.</h1>
          <p className="dashboard__subtitle">
            Organize ideas, projects, and everything your team is building.
          </p>
        </div>

        <span className="dashboard__count">
          {boards.length} {boards.length === 1 ? "board" : "boards"}
        </span>
      </header>

      <section className="create-board" aria-labelledby="create-board-title">
        <div className="create-board__heading">
          <h2 id="create-board-title">Create a board</h2>
          <p>Start with a name and a little context.</p>
        </div>

        <form onSubmit={handleCreateBoard}>
          <div className="form-field">
            <label htmlFor="board-title">Board title</label>
            <input
              id="board-title"
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              placeholder="e.g. Website launch"
              maxLength={100}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="board-description">
              Description <span>(optional)</span>
            </label>
            <textarea
              id="board-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will this board help you accomplish?"
              rows={3}
              maxLength={500}
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="button button--primary" type="submit">
            <span aria-hidden="true">+</span> Create board
          </button>
        </form>
      </section>

      <section className="boards-section" aria-labelledby="boards-title">
        <div className="boards-section__heading">
          <div>
            <h2 id="boards-title">Your boards</h2>
            <p>Everything you're working on, in one place.</p>
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon" aria-hidden="true">
              ◫
            </span>
            <h3>Your workspace starts here</h3>
            <p>Create your first board to turn an idea into a plan.</p>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
