// compon
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Comments from '@/pages/Comments';
import { Task, Subtask } from '@/types/types';
import { Column } from '@/components/auth/stores/useColumns.store';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task | null;
  prefillDate?: string;
  columns?: Column[];
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, columns = [] }) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: string;
    assignee: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    color: string;
    subtasks: Subtask[];
  }>({
    title: '',
    description: '',
    status: 'todo',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    tags: [],
    color: '#6b7280',
    subtasks: [],
  });

  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  const teamMembers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'];
  const colorOptions = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate,
        priority: task.priority,
        tags: task.tags || [],
        color: task.color || '#6b7280',
        subtasks: task.subtasks || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: columns[0]?.id || '',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        tags: [],
        color: '#6b7280',
        subtasks: [],
      });
    }
  }, [task, isOpen, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: Date.now(),
        title: newSubtask,
        description: '',
        status: 'todo',
        assignee: '',
        dueDate: '',
        priority: 'medium',
        tags: [],
        completed: false,
      };
      setFormData({ ...formData, subtasks: [...formData.subtasks, subtask] });
      setNewSubtask('');
      toast({ title: 'Subtask Added', description: 'New subtask has been added successfully.' });
    }
  };

  const handleDeleteSubtask = (subtaskId: number) => {
    setFormData({ ...formData, subtasks: formData.subtasks.filter(st => st.id !== subtaskId) });
  };

  const handleUpdateSubtask = (subtaskId: number, updates: Partial<Subtask>) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.map(st => (st.id === subtaskId ? { ...st, ...updates } : st)),
    });
  };

  const handleAssigneeChange = (value: string) => {
    if (value.includes('@')) {
      const mentioned = teamMembers.find(member =>
        member.toLowerCase().includes(value.toLowerCase().replace('@', ''))
      );
      if (mentioned) {
        setFormData({ ...formData, assignee: mentioned });
        return;
      }
    }
    setFormData({ ...formData, assignee: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
             {"Make changes to your task here. Click save when done."}
      </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="color">Task Color</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(column => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee">Assignee (type @ to mention)</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                placeholder="@username or name"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <Label>Subtasks</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
              />
              <Button type="button" onClick={handleAddSubtask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
              {formData.subtasks.map(st => (
                <div key={st.id} className="border rounded-lg p-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={(e) => handleUpdateSubtask(st.id, { completed: e.target.checked })}
                  />
                  <Input
                    value={st.title}
                    onChange={(e) => handleUpdateSubtask(st.id, { title: e.target.value })}
                    className="flex-1"
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleDeleteSubtask(st.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-4">Comments</h3>
            <Comments />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{task ? 'Update' : 'Create'} Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
