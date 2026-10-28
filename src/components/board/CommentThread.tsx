
import { useState } from "react";
import type { TaskComment, CommentId } from "../../types/comments";

interface CommentThreadProps {
  comments: Record<CommentId, TaskComment>;
  commentIds: CommentId[];
  onCreate: (content: string, parentId: CommentId | null) => void;
  onUpdate: (commentId: CommentId, content: string) => void;
  onDelete: (commentId: CommentId) => void;
}

interface CommentItemProps extends CommentThreadProps {
  commentId: CommentId;
  depth: number;
}

function CommentItem({
  commentId,
  depth,
  comments,
  commentIds,
  onCreate,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const comment = comments[commentId];
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment?.content ?? "");

  if (!comment) return null;

  const childIds = commentIds.filter(
    (id) => comments[id]?.parentId === commentId
  );

  function submitReply() {
    const cleanContent = content.trim();
    if (!cleanContent) return;

    onCreate(cleanContent, commentId);
    setContent("");
    setReplying(false);
  }

  function submitEdit() {
    const cleanContent = content.trim();
    if (!cleanContent) return;

    onUpdate(commentId, cleanContent);
    setEditing(false);
  }

  return (
    <article className="comment" style={{ marginLeft: depth * 16 }}>
      <p className="comment__author">{comment.author}</p>

      {editing ? (
        <div>
          <textarea
            aria-label="Edit comment"
            value={content}
            maxLength={2000}
            onChange={(event) => setContent(event.target.value)}
          />
          <button type="button" onClick={submitEdit}>Save</button>
          <button
            type="button"
            onClick={() => {
              setContent(comment.content);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <p className="comment__content">{comment.content}</p>
      )}

      <div className="comment__actions">
        <button
          type="button"
          onClick={() => {
            setContent("");
            setReplying((current) => !current);
          }}
        >
          Reply
        </button>
        <button
          type="button"
          onClick={() => {
            setContent(comment.content);
            setEditing(true);
          }}
        >
          Edit
        </button>
        <button type="button" onClick={() => onDelete(commentId)}>
          Delete
        </button>
      </div>

      {replying && (
        <div className="comment__reply-form">
          <textarea
            aria-label="Write a reply"
            value={content}
            maxLength={2000}
            onChange={(event) => setContent(event.target.value)}
          />
          <button type="button" onClick={submitReply}>Send reply</button>
          <button type="button" onClick={() => setReplying(false)}>
            Cancel
          </button>
        </div>
      )}

      {childIds.map((childId) => (
        <CommentItem
          key={childId}
          commentId={childId}
          depth={depth + 1}
          comments={comments}
          commentIds={commentIds}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </article>
  );
}

export function CommentThread(props: CommentThreadProps) {
  const [newComment, setNewComment] = useState("");

  const rootIds = props.commentIds.filter(
    (id) => props.comments[id]?.parentId === null
  );

  function submitComment() {
    const cleanContent = newComment.trim();
    if (!cleanContent) return;

    props.onCreate(cleanContent, null);
    setNewComment("");
  }

  return (
    <section className="comment-thread" aria-label="Task comments">
      <h3>Comments</h3>

      <div className="comment-thread__new">
        <label htmlFor="new-comment">Add a comment</label>
        <textarea
          id="new-comment"
          value={newComment}
          maxLength={2000}
          onChange={(event) => setNewComment(event.target.value)}
        />
        <button type="button" onClick={submitComment}>
          Post comment
        </button>
      </div>

      {rootIds.length === 0 ? (
        <p>No comments yet. Start the conversation.</p>
      ) : (
        rootIds.map((id) => (
          <CommentItem
            key={id}
            commentId={id}
            depth={0}
            {...props}
          />
        ))
      )}
    </section>
  );
}
