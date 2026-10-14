
import { useEffect, useState, type FormEvent } from "react";
import type { TaskCard } from "../../types/workspace";

interface TaskFormProps {
  initialCard?: TaskCard;
  onSave: (values: {
    title: string;
    description: string;
    tags: string[];
    dueDate: string | null;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({
  initialCard,
  onSave,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialCard?.title ?? "");
  const [description, setDescription] = useState(
    initialCard?.description ?? ""
  );
  const [tagsText, setTagsText] = useState(
    initialCard?.tags.join(", ") ?? ""
  );
  const [dueDate, setDueDate] = useState(
    initialCard?.dueDate ?? ""
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    const tags = [
      ...new Set(
        tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    onSave({
      title: cleanTitle,
      description: description.trim(),
      tags,
      dueDate: dueDate || null,
    });
  }

  return (
    <div
      className="task-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <h2 id="task-form-title">
          {initialCard ? "Edit task" : "Create task"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="form-field">
            <label htmlFor="task-tags">Tags</label>
            <input
              id="task-tags"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              placeholder="Design, Urgent, Frontend"
            />
            <p className="form-hint">
              Separate tags with commas.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="task-modal__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button className="button button--primary" type="submit">
              {initialCard ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
