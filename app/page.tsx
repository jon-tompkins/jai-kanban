'use client';

import { useState, useEffect } from 'react';
import initialTasksData from '../data/tasks.json';

interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  project?: string;
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
  maxActive?: number;
  tags: string[];
  projects: string[];
  assignees: string[];
  tasks: Task[];
}

const tagColors: Record<string, string> = {
  dev: 'bg-amber-500 text-black',
  research: 'bg-emerald-500 text-black',
  strategy: 'bg-amber-500 text-black',
  design: 'bg-pink-500 text-black'
};

const projectColors: Record<string, string> = {
  clawstreet: 'bg-blue-600 text-white',
  junto: 'bg-purple-600 text-white',
  research: 'bg-emerald-600 text-white',
  infra: 'bg-gray-600 text-white',
  personal: 'bg-rose-600 text-white'
};

export default function Home() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  
  // Load from localStorage or fall back to initial data
  useEffect(() => {
    const stored = localStorage.getItem('kanban-data');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // Add defaults if missing
      const enhanced = {
        ...initialTasksData,
        projects: initialTasksData.projects || ['clawstreet', 'junto', 'research', 'infra', 'personal'],
        assignees: initialTasksData.assignees || ['jon', 'jai', 'builder', 'scout']
      } as KanbanData;
      setData(enhanced);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (data) {
      localStorage.setItem('kanban-data', JSON.stringify(data));
    }
  }, [data]);

  if (!data) return <div className="min-h-screen bg-[#0a0a0a]" />;
  
  const columns = ['queue', 'active', 'review', 'done'];
  const allTags = ['all', ...data.tags];
  
  const filteredTasks = filter === 'all' 
    ? data.tasks 
    : data.tasks.filter(t => t.tags.includes(filter) || t.project === filter);
  
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col] = filteredTasks.filter(t => t.status === col);
    return acc;
  }, {} as Record<string, Task[]>);

  const activeCount = tasksByColumn['active'].length;
  const maxActive = data.maxActive || 5;

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      };
    });
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-mono">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-gray-800">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
              filter === tag 
                ? 'bg-amber-500 text-black font-bold' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tag}
          </button>
        ))}
        <span className="text-gray-700 mx-2">|</span>
        {data.projects?.map(proj => (
          <button
            key={proj}
            onClick={() => setFilter(proj)}
            className={`px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
              filter === proj 
                ? projectColors[proj] || 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {proj}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-h-[calc(100vh-60px)]">
        {columns.map(col => (
          <div key={col} className="border-r border-gray-800 flex flex-col">
            {/* Column header */}
            <div className="p-3 border-b border-gray-800">
              <span className="text-gray-500 uppercase text-sm tracking-wider">
                {col} ({tasksByColumn[col].length})
                {col === 'active' && (
                  <span className="text-amber-500 ml-1">({activeCount}/{maxActive})</span>
                )}
              </span>
            </div>
            
            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {tasksByColumn[col].map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  isEditing={editingTask === task.id}
                  onEdit={() => setEditingTask(editingTask === task.id ? null : task.id)}
                  onUpdate={(updates) => updateTask(task.id, updates)}
                  onMove={(status) => moveTask(task.id, status)}
                  projects={data.projects || []}
                  assignees={data.assignees || []}
                  tags={data.tags || []}
                />
              ))}
            </div>
            
            {/* Add card button */}
            <div className="p-2 border-t border-gray-800">
              <button className="w-full py-2 text-gray-600 hover:text-gray-400 text-sm transition-colors">
                + Add Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onMove: (status: Task['status']) => void;
  projects: string[];
  assignees: string[];
  tags: string[];
}

function TaskCard({ task, isEditing, onEdit, onUpdate, onMove, projects, assignees, tags }: TaskCardProps) {
  const statuses: Task['status'][] = ['queue', 'active', 'review', 'done'];

  return (
    <div className="bg-[#111] border border-gray-800 p-3 hover:border-gray-600 transition-colors">
      {/* Project badge */}
      {task.project && (
        <div className={`inline-block text-[10px] px-2 py-0.5 uppercase font-bold mb-2 ${projectColors[task.project] || 'bg-gray-600'}`}>
          {task.project}
        </div>
      )}
      
      <h3 className="text-white text-sm font-medium mb-2">{task.title}</h3>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map(tag => (
          <span
            key={tag}
            className={`text-[10px] px-2 py-0.5 uppercase font-bold ${tagColors[tag] || 'bg-gray-600 text-white'}`}
          >
            {tag}
          </span>
        ))}
      </div>
      
      <p className="text-gray-500 text-xs line-clamp-2">{task.description}</p>
      
      {/* Assignee */}
      <div className="mt-2 flex justify-between items-center">
        <span className="text-[10px] text-gray-600 uppercase">→ {task.assignee}</span>
        <button 
          onClick={onEdit}
          className="text-[10px] text-gray-600 hover:text-amber-500 uppercase"
        >
          {isEditing ? 'close' : 'edit'}
        </button>
      </div>
      
      {/* Edit panel */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3">
          {/* Assignee select */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase block mb-1">Assignee</label>
            <select 
              value={task.assignee}
              onChange={(e) => onUpdate({ assignee: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs p-2"
            >
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          {/* Project select */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase block mb-1">Project</label>
            <select 
              value={task.project || ''}
              onChange={(e) => onUpdate({ project: e.target.value || undefined })}
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-xs p-2"
            >
              <option value="">None</option>
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          {/* Tags multi-select */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase block mb-1">Tags</label>
            <div className="flex flex-wrap gap-1">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    const newTags = task.tags.includes(tag)
                      ? task.tags.filter(t => t !== tag)
                      : [...task.tags, tag];
                    onUpdate({ tags: newTags });
                  }}
                  className={`text-[10px] px-2 py-1 uppercase ${
                    task.tags.includes(tag) 
                      ? tagColors[tag] || 'bg-gray-500'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Move to column */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase block mb-1">Move to</label>
            <div className="flex gap-1">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => onMove(s)}
                  className={`text-[10px] px-2 py-1 uppercase ${
                    task.status === s 
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
