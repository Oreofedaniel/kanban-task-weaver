// components/Comments.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Trash2, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCommentsStore } from "@/components/auth/stores/useCommentsStore";
import { useAuthStore } from "@/components/auth/stores/auth.store";

interface CommentsProps {
  taskId?: string;
}

const Comments: React.FC<CommentsProps> = ({ taskId }) => {
  const { comments, loading, fetchComments, addComment, editComment, deleteComment, clearComments } =
    useCommentsStore();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (taskId) {
      fetchComments(taskId);
    } else {
      clearComments();
    }
  }, [taskId, fetchComments, clearComments]);

  if (!taskId) {
    return <p className="text-sm text-gray-500">Save the task first, then you can add comments.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addComment(taskId, user.id, newComment.trim());
      setNewComment("");
    } catch (err) {
      toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editValue.trim() || !user) return;
    try {
      await editComment(taskId, commentId, user.id, editValue.trim());
      setEditingId(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update comment.", variant: "destructive" });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    try {
      await deleteComment(taskId, commentId, user.id);
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div>
      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const { date, time } = formatDateTime(comment.timestamp);
            const isOwner = user?.id === comment.userId;
            return (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {date} at {time}
                    </span>
                    {isOwner && editingId !== comment.id && (
                      <span className="ml-auto flex gap-1">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-700"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditValue(comment.content);
                          }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-1 space-y-2">
                      <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={2} />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={() => handleSaveEdit(comment.id)}>
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={handleSubmit}>
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
