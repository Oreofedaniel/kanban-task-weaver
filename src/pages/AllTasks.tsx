import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Folder } from 'lucide-react';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/components/auth/stores/useWorkspace.store';

interface RawTask {
  _id: string;
  title: string;
  description?: string;
  workspaceId?: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  completed: 'Done',
  'in-progress': 'In Progress',
};

const AllTasks = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [tasks, setTasks] = useState<RawTask[]>([]);
  const [loading, setLoading] = useState(true);

  const statusParam = searchParams.get('status') || '';
  const backendStatus = STATUS_MAP[statusParam] || statusParam;

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    setLoading(true);
    api
      .get<RawTask[]>('/tasks', { params: backendStatus ? { status: backendStatus } : {} })
      .then(({ data }) => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [backendStatus]);

  const workspaceName = (workspaceId?: string) =>
    workspaces.find((w) => w.id === workspaceId)?.name || 'Unknown workspace';

  const title = backendStatus ? `Tasks: ${backendStatus}` : 'All Tasks';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">
          {backendStatus
            ? `Every task currently in a column named "${backendStatus}", across all your workspaces.`
            : 'Every task across all your workspaces.'}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found for this status.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card
              key={task._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => task.workspaceId && navigate(`/app/kanban/${task.workspaceId}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  {task.priority && <Badge variant="outline">{task.priority}</Badge>}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Folder className="w-3 h-3" />
                    {workspaceName(task.workspaceId)}
                  </span>
                  {task.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignee}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTasks;
