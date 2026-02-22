'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'queue' | 'active' | 'review' | 'done';
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  created: string;
  spec?: string;
  subtasks?: string[];
}

interface KanbanData {
  lastUpdated: string;
  columns: string[];
  tasks: Task[];
}

const columnLabels: Record<string, string> = {
  queue: '📋 Queue',
  active: '🔥 Active',
  review: '👀 Review',
  done: '✅ Done'
};

const priorityColors: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500'
};

const tagColors: Record<string, string> = {
  dev: 'bg-blue-600',
  research: 'bg-purple-600',
  strategy: 'bg-orange-600',
  design: 'bg-pink-600'
};

export default function Home() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load tasks</div>
      </div>
    );
  }

  const columns = ['queue', 'active', 'review', 'done'];
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col] = data.tasks.filter(t => t.status === col);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">⚡ Jai Kanban</h1>
        <p className="text-gray-400 text-sm">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(col => (
          <div key={col} className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {columnLabels[col]}
              <span className="bg-gray-700 text-gray-300 text-sm px-2 py-0.5 rounded">
                {tasksByColumn[col].length}
              </span>
            </h2>
            <div className="space-y-3">
              {tasksByColumn[col].map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByColumn[col].length === 0 && (
                <div className="text-gray-500 text-sm text-center py-4">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-gray-700 rounded-lg p-3 border-l-4 ${priorityColors[task.priority]} cursor-pointer hover:bg-gray-600 transition-colors`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map(tag => (
          <span
            key={tag}
            className={`text-xs px-2 py-0.5 rounded ${tagColors[tag] || 'bg-gray-600'}`}
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="font-medium text-white mb-1">{task.title}</h3>
      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-gray-300 text-sm">{task.description}</p>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-400 text-xs uppercase mb-1">Subtasks</p>
              <ul className="text-sm text-gray-300 space-y-1">
                {task.subtasks.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    {st}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600">
            <span>Assignee: {task.assignee}</span>
            <span>{task.priority} priority</span>
          </div>
        </div>
      )}
    </div>
  );
}
