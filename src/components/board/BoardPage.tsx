import type React from "react";
import { 
    useState,
    type FormEvent 
} from "react";

import { TaskCardItem } from "./TaskCardItem";
import { TaskForm } from "./TaskForm";
import type { TaskCard } from "../../types/workspace";

import { Link, useParams } from "react-router-dom";

import { useWorkspace } from "../../hooks/useWorkspace";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  workspaceSync,
  workspaceSyncClientId,
} from "../../api/workspaceSync";

let syncVersion = 0;

export default function BoardPage() {
  const { boardId } = useParams();
  const { state, dispatch } = useWorkspace();

  const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

  const [columnTitle, setColumnTitle] = useState("");
  const [error, setError] = useState("");

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<TaskCard | undefined>();
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);


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
  
  function handleOpenCreateTask(columnId: string) {
  setActiveColumnId(columnId);
  setEditingCard(undefined);
  setIsTaskFormOpen(true);
}

function handleOpenEditTask(card: TaskCard) {
  setActiveColumnId(card.columnId);
  setEditingCard(card);
  setIsTaskFormOpen(true);
}

function handleDeleteTask(cardId: string) {
  const confirmed = window.confirm("Delete this task?");

  if (!confirmed) return;

  dispatch({
    type: "CARD_DELETED",
    payload: { cardId },
  });
}

function handleMoveTask(
  card: TaskCard,
  destinationColumnId: string
) {
  if (card.columnId === destinationColumnId) return;

  dispatch({
    type: "CARD_UPDATED",
    payload: {
      ...card,
      columnId: destinationColumnId,
    },
  });
}

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const activeId = String(active.id);

  if (!activeId.startsWith("card:")) return;

  const cardId = activeId.slice("card:".length);
  const card = state.cards[cardId];

  if (!card) return;

  const overId = String(over.id);

  let destinationColumnId: string;
  let destinationIndex: number;

  if (overId.startsWith("column:")) {
    destinationColumnId = overId.slice("column:".length);

    const destinationColumn = state.columns[destinationColumnId];

    if (!destinationColumn) return;

    destinationIndex = destinationColumn.cardIds.length;
  } else if (overId.startsWith("card:")) {
    const overCardId = overId.slice("card:".length);
    const overCard = state.cards[overCardId];

    if (!overCard) return;

    destinationColumnId = overCard.columnId;

    const destinationColumn = state.columns[destinationColumnId];

    if (!destinationColumn) return;

    destinationIndex = destinationColumn.cardIds.indexOf(overCardId);

    if (destinationIndex < 0) return;

    // When moving downward in the same column, account for
    // removing the dragged card before inserting it.
    if (
      card.columnId === destinationColumnId &&
      destinationColumn.cardIds.indexOf(cardId) < destinationIndex
    ) {
      destinationIndex -= 1;
    }
  } else {
    return;
  }

 const nextVersion = ++syncVersion;
const timestamp = Date.now();

dispatch({
  type: "CARD_MOVED",
  payload: {
    cardId,
    destinationColumnId,
    destinationIndex,
  },
});

dispatch({
  type: "LOCAL_CARD_MOVE_VERSION_RECORDED",
  payload: {
    cardId,
    timestamp,
    sequence: nextVersion,
    clientId: workspaceSyncClientId,
  },
});

workspaceSync.publish({
  type: "CARD_MOVED",
  cardId,
  destinationColumnId,
  destinationIndex,
  version: nextVersion,
  sequence: nextVersion,
  clientId: workspaceSyncClientId,
  timestamp,
});
}

function handleSaveTask(values: {
  title: string;
  description: string;
  tags: string[];
  dueDate: string | null;
}) {
  if (editingCard) {
    dispatch({
      type: "CARD_UPDATED",
      payload: {
        ...editingCard,
        ...values,
      },
    });
  } else if (activeColumnId) {
  const newCard: TaskCard = {
    id: crypto.randomUUID(),
    columnId: activeColumnId,
    ...values,
  };

  dispatch({
    type: "CARD_CREATED",
    payload: newCard,
  });

     const nextVersion = ++syncVersion;

    workspaceSync.publish({
      type: "CARD_CREATED",
      card: newCard,
      version: nextVersion,
      sequence: nextVersion,
      clientId: workspaceSyncClientId,
      timestamp: Date.now(),
    });
  } else {
    return;
  }

  setIsTaskFormOpen(false);
  setEditingCard(undefined);
  setActiveColumnId(null);
}

function handleCloseTaskForm() {
  setIsTaskFormOpen(false);
  setEditingCard(undefined);
  setActiveColumnId(null);
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
          <DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragEnd={handleDragEnd}
>
          <div className="columns-grid">
     {columns.map((column) => (
  <DroppableColumn id={column.id} key={column.id}>
    <div className="column-card__heading">
      <h3>{column.title}</h3>
      <span>{column.cardIds.length} cards</span>
    </div>
    

    <div className="column-card__actions">
      <button
        type="button"
        className="button button--secondary"
        onClick={() => handleRenameColumn(column.id, column.title)}
        aria-label={`Rename ${column.title} column`}
      >
        Rename
      </button>

      <button
        type="button"
        className="button button--danger"
        onClick={() => handleDeleteColumn(column.id, column.title)}
        aria-label={`Delete ${column.title} column`}
      >
        Delete
      </button>
    </div>
    

    <button
      type="button"
      className="button button--primary task-add-button"
      onClick={() => handleOpenCreateTask(column.id)}
    >
      + Add task
    </button>

    <SortableContext
      items={column.cardIds.map((cardId) => `card:${cardId}`)}
      strategy={verticalListSortingStrategy}
    >
      <div className="task-list">
        {column.cardIds.map((cardId) => {
          const card = state.cards[cardId];

          if (!card) return null;

          return (
            <SortableTask id={card.id} key={card.id}>
              <TaskCardItem
                card={card}
                columns={columns.map((item) => ({
                  id: item.id,
                  title: item.title,
                }))}
                onEdit={handleOpenEditTask}
                onDelete={handleDeleteTask}
                onMove={handleMoveTask}
              />
            </SortableTask>
          );
        })}
      </div>
    </SortableContext>
  </DroppableColumn>
))}
          </div>
          </DndContext>
        )}
      </section>
      {isTaskFormOpen && (
  <TaskForm
    initialCard={editingCard}
    onSave={handleSaveTask}
    onCancel={handleCloseTaskForm}
  />
)}
    </main>
  );
}

type SortableTaskProps = {
  id: string;
  children: React.ReactNode;
};

function SortableTask({ id, children }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `card:${id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
  ref={setNodeRef}
  style={style}
>
  <div
    className="task-card__drag-handle"
    {...attributes}
    {...listeners}
    aria-label="Drag task to reorder"
  >
    ⠿ Drag task
  </div>

  {children}
</div>
  );
}

type DroppableColumnProps = {
  id: string;
  children: React.ReactNode;
};

function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column:${id}`,
  });

  return (
    <article
      ref={setNodeRef}
      className="column-card"
      style={{
        outline: isOver ? "2px dashed var(--accent, #777)" : undefined,
        outlineOffset: isOver ? "3px" : undefined,
      }}
    >
      {children}
    </article>
  );
}