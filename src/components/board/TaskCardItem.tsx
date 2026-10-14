
import { memo } from "react";
import type { TaskCard } from "../../types/workspace";
import ReactMarkdown from "react-markdown";

interface TaskCardItemProps {
  card: TaskCard;
  onEdit: (card: TaskCard) => void;
  onDelete: (cardId: string) => void;
  onMove: (card: TaskCard, destinationColumnId: string) => void;
  columns: { id: string; title: string }[];
}

function TaskCardItemComponent({
  card,
  onEdit,
  onDelete,
  onMove,
  columns,
}: TaskCardItemProps) {
  const formattedDueDate = card.dueDate
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
      }).format(new Date(card.dueDate))
    : null;

  return (
    <article className="task-card">
      <div className="task-card__header">
        <h4>{card.title}</h4>

        <button
          type="button"
          className="task-card__icon-button"
          onClick={() => onDelete(card.id)}
          aria-label={`Delete task ${card.title}`}
        >
          Delete
        </button>
      </div>

      {card.description && (
  <div className="task-card__description">
    <ReactMarkdown
      skipHtml
      components={{
        a: ({ ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
      }}
    >
      {card.description}
    </ReactMarkdown>
  </div>
)}

      {card.tags.length > 0 && (
        <ul className="task-card__tags" aria-label="Task tags">
          {card.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}

      {formattedDueDate && (
        <p className="task-card__due-date">
          Due {formattedDueDate}
        </p>
      )}

      <div className="task-card__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => onEdit(card)}
        >
          Edit
        </button>

        <label className="task-card__move">
          <span className="sr-only">Move {card.title} to column</span>
          <select
            value={card.columnId}
            onChange={(event) => onMove(card, event.target.value)}
            aria-label={`Move ${card.title} to another column`}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                Move to: {column.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}

export const TaskCardItem = memo(TaskCardItemComponent);
