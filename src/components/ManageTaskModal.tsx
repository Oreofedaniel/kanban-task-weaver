import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useColumnsStore, Column } from '@/components/auth/stores/useColumns.store';

interface ManageTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

const colorOptions = [
  'bg-gray-100',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-red-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100',
];

const ManageTaskModal: React.FC<ManageTaskModalProps> = ({ isOpen, onClose, workspaceId }) => {
  const { columns, addColumn, updateColumn, deleteColumn } = useColumnsStore();
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddColumn = async () => {
    const title = newColumnTitle.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      await addColumn(workspaceId, title);
      setNewColumnTitle('');
      toast({
        title: 'Column Added',
        description: 'New task status column has been added.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to add column.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
      toast({
        title: 'Column Deleted',
        description: 'Task status column has been deleted.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete column.',
        variant: 'destructive',
      });
    }
  };

  const handleEditColumn = async (columnId: string, newTitle: string) => {
    setEditingColumn(null);
    if (!newTitle.trim()) return;
    try {
      await updateColumn(columnId, { name: newTitle.trim() });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update column.',
        variant: 'destructive',
      });
    }
  };

  const handleColorChange = async (column: Column, color: string) => {
    try {
      await updateColumn(column.id, { color });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update column color.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Statuses</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Add New Status</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter status name..."
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              />
              <Button onClick={handleAddColumn} disabled={submitting}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Current Statuses</Label>
            <div className="space-y-3 mt-2 max-h-[400px] overflow-y-auto">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-4 h-4 rounded ${column.color}`}></div>

                  {editingColumn === column.id ? (
                    <Input
                      defaultValue={column.title}
                      onBlur={(e) => handleEditColumn(column.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditColumn(column.id, (e.target as HTMLInputElement).value);
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1 font-medium">{column.title}</span>
                  )}

                  <select
                    value={column.color}
                    onChange={(e) => handleColorChange(column, e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color.replace('bg-', '').replace('-100', '')}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingColumn(column.id)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteColumn(column.id)}
                      disabled={columns.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTaskModal;
