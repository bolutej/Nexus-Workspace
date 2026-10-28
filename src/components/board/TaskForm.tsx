import { useState, type FormEvent } from "react";
import { useModalAccessibility } from "../../hooks/useModalAccessibility";
import type { TaskCard } from "../../types/workspace";
import { useWorkspace } from "../../context/WorkspaceContext";
import { CommentThread } from "./CommentThread";
import type { CommentId, TaskComment } from "../../types/comments";

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

function getLocalDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function TaskForm({
  initialCard,
  onSave,
  onCancel,
}: TaskFormProps) {
  const { state, dispatch } = useWorkspace();

  const modalRef = useModalAccessibility(true, onCancel);
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

  function handleCreateComment(
  content: string,
  parentId: CommentId | null
) {
  if (!initialCard) return;

  const comment: TaskComment = {
    id: crypto.randomUUID(),
    cardId: initialCard.id,
    parentId,
    content,
    author: "You",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dispatch({
    type: "COMMENT_CREATED",
    payload: { comment },
  });
}

function handleUpdateComment(
  commentId: CommentId,
  content: string
) {
  dispatch({
    type: "COMMENT_UPDATED",
    payload: { commentId, content },
  });
}

function handleDeleteComment(commentId: CommentId) {
  dispatch({
    type: "COMMENT_DELETED",
    payload: { commentId },
  });
}

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

  const today = getLocalDateString();

const minimumDueDate =
  initialCard?.dueDate && initialCard.dueDate < today
    ? initialCard.dueDate
    : today;
  return (
    <div
      className="task-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
  ref={modalRef}
  className="task-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="task-form-title"
  tabIndex={-1}
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
  min={minimumDueDate}
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
        {initialCard && (
  <CommentThread
    comments={state.comments ?? {}}
    commentIds={
      state.commentIdsByCard?.[initialCard.id] ?? []
    }
    onCreate={handleCreateComment}
    onUpdate={handleUpdateComment}
    onDelete={handleDeleteComment}
  />
)}
      </section>
    </div>
  );
}
