import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GitCommit,
  Calendar as CalendarIcon,
  User,
  Clock,
  Edit,
  Archive,
  ArchiveRestore,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Commitment, Priority, Status, Tab } from '@/types/commitment';
import {
  fetchCommitments,
  createCommitment,
  updateCommitment,
  archiveCommitment,
  restoreCommitment,
  errorMessage,
} from '@/lib/commitments';
import { fetchUsers, AppUser } from '@/lib/users';

const TABS: Tab[] = ['All', 'Upcoming', 'Due Today', 'Completed', 'Archived'];
const UNASSIGNED = 'unassigned';

interface EditState {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  dueDate: string; // yyyy-MM-dd
}

const emptyForm = () => ({
  title: '',
  description: '',
  assigneeId: UNASSIGNED,
  dueDate: new Date(),
  priority: 'Medium' as Priority,
});

const Commitments = () => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tab, setTab] = useState<Tab>('All');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [newCommitment, setNewCommitment] = useState(emptyForm());

  const load = useCallback(async () => {
    try {
      setCommitments(await fetchCommitments(tab));
    } catch (err) {
      toast({ title: 'Error', description: errorMessage(err, 'Failed to load commitments'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const run = async (action: () => Promise<void>, success: { title: string; description: string }) => {
    try {
      await action();
      toast(success);
      await load();
    } catch (err) {
      toast({ title: 'Error', description: errorMessage(err, 'Something went wrong'), variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!newCommitment.title.trim()) {
      toast({ title: 'Missing title', description: 'Please enter a title', variant: 'destructive' });
      return;
    }
    await run(
      async () => {
        await createCommitment({
          title: newCommitment.title.trim(),
          description: newCommitment.description,
          dueDate: newCommitment.dueDate.toISOString(),
          assigneeId: newCommitment.assigneeId === UNASSIGNED ? null : newCommitment.assigneeId,
          priority: newCommitment.priority,
          status: 'Not Started',
        });
        setNewCommitment(emptyForm());
        setIsCreating(false);
      },
      { title: 'Commitment Created', description: 'New commitment has been created successfully' }
    );
  };

  const handleStatusChange = (id: string, status: Status) =>
    run(() => updateCommitment(id, { status }), {
      title: 'Status Updated',
      description: 'Commitment status has been updated',
    });

  const handleArchive = (id: string) =>
    run(() => archiveCommitment(id), {
      title: 'Commitment Archived',
      description: 'Moved to the Archived tab. You can restore it any time.',
    });

  const handleRestore = (id: string) =>
    run(() => restoreCommitment(id), {
      title: 'Commitment Restored',
      description: 'Commitment has been restored successfully',
    });

  const startEdit = (c: Commitment) =>
    setEditing({
      id: c.id,
      title: c.title,
      description: c.description,
      assigneeId: c.assignee?.id || UNASSIGNED,
      priority: c.priority,
      dueDate: format(new Date(c.dueDate), 'yyyy-MM-dd'),
    });

  const handleSaveEdit = async () => {
    if (!editing || !editing.title.trim()) return;
    await run(
      async () => {
        await updateCommitment(editing.id, {
          title: editing.title.trim(),
          description: editing.description,
          assigneeId: editing.assigneeId === UNASSIGNED ? null : editing.assigneeId,
          priority: editing.priority,
          dueDate: new Date(`${editing.dueDate}T00:00:00`).toISOString(),
        });
        setEditing(null);
      },
      { title: 'Commitment Updated', description: 'Commitment has been updated successfully' }
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOverdue = (c: Commitment) =>
    c.status !== 'Completed' && !c.archived && new Date(c.dueDate) < startOfToday;

  const assigneeSelect = (value: string, onChange: (v: string) => void) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Assignee" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const prioritySelect = (value: Priority, onChange: (v: Priority) => void) => (
    <Select value={value} onValueChange={(v: Priority) => onChange(v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Low">Low Priority</SelectItem>
        <SelectItem value="Medium">Medium Priority</SelectItem>
        <SelectItem value="High">High Priority</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commitments</h1>
          <p className="text-gray-600">Track and manage team commitments and deadlines</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Commitment
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>

      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Commitment</CardTitle>
            <CardDescription>Add a new commitment for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Commitment title..."
                value={newCommitment.title}
                onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
              />
              <Textarea
                placeholder="Description..."
                value={newCommitment.description}
                onChange={(e) => setNewCommitment({ ...newCommitment, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assigneeSelect(newCommitment.assigneeId, (v) => setNewCommitment({ ...newCommitment, assigneeId: v }))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(newCommitment.dueDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newCommitment.dueDate}
                      onSelect={(date) => date && setNewCommitment({ ...newCommitment, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {prioritySelect(newCommitment.priority, (v) => setNewCommitment({ ...newCommitment, priority: v }))}
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreate}>Create Commitment</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading commitments...</p>
        ) : commitments.length === 0 ? (
          <p className="text-gray-500">No commitments in "{tab}".</p>
        ) : (
          commitments.map((commitment) => (
            <Card key={commitment.id}>
              <CardContent className="p-6">
                {editing?.id === commitment.id ? (
                  <div className="space-y-4">
                    <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                    <Textarea
                      value={editing.description}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {assigneeSelect(editing.assigneeId, (v) => setEditing({ ...editing, assigneeId: v }))}
                      <Input
                        type="date"
                        value={editing.dueDate}
                        onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
                      />
                      {prioritySelect(editing.priority, (v) => setEditing({ ...editing, priority: v }))}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEdit}>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(null)}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <GitCommit className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{commitment.title}</h3>
                        <Badge className={getPriorityColor(commitment.priority)}>{commitment.priority}</Badge>
                        <Badge className={getStatusColor(commitment.status)}>{commitment.status}</Badge>
                        {isOverdue(commitment) && <Badge className="bg-red-600 text-white">Overdue</Badge>}
                        {commitment.archived && <Badge variant="outline">Archived</Badge>}
                      </div>
                      {commitment.description && <p className="text-gray-600 mb-3">{commitment.description}</p>}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>Assigned to: {commitment.assignee?.name || 'Unassigned'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Due: {format(new Date(commitment.dueDate), 'PPP')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created: {format(new Date(commitment.createdAt), 'PPP')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!commitment.archived && (
                        <Select
                          value={commitment.status}
                          onValueChange={(v: Status) => handleStatusChange(commitment.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {commitment.archived ? (
                        <Button size="sm" variant="outline" onClick={() => handleRestore(commitment.id)}>
                          <ArchiveRestore className="w-4 h-4 mr-1" /> Restore
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" title="Edit" onClick={() => startEdit(commitment)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleArchive(commitment.id)}>
                            <Archive className="w-4 h-4 mr-1" /> Archive
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Commitments;
