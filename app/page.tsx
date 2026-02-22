'use client';

import { useState } from 'react';
import tasksData from '../data/tasks.json';

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
  maxActive?: number;
  tags: string[];
  tasks: Task[];
}

const tagColors: Record<string, string> = {
  dev: 'bg-amber-500 text-black',
  research: 'bg-emerald-500 text-black',
  strategy: 'bg-amber-500 text-black',
  design: 'bg-pink-500 text-black'
};

export default function Home() {
  const data = tasksData as KanbanData;
  const [filter, setFilter] = useState<string>('all');
  
  const columns = ['queue', 'active', 'review', 'done'];
  const allTags = ['all', ...data.tags];
  
  const filteredTasks = filter === 'all' 
    ? data.tasks 
    : data.tasks.filter(t => t.tags.includes(filter));
  
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col] = filteredTasks.filter(t => t.status === col);
    return acc;
  }, {} as Record<string, Task[]>);

  const activeCount = tasksByColumn['active'].length;
  const maxActive = data.maxActive || 5;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-mono">
      {/* Filter tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-800">
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
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 h-[calc(100vh-60px)]">
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
                <TaskCard key={task.id} task={task} />
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

function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-[#111] border border-gray-800 p-3 cursor-pointer hover:border-gray-600 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <h3 className="text-white text-sm font-medium mb-2">{task.title}</h3>
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
      <div className="mt-2 text-[10px] text-gray-600 uppercase">
        → {task.assignee}
      </div>
      
      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-800">
          <p className="text-gray-600 text-[10px] uppercase mb-1">Subtasks</p>
          <ul className="text-xs text-gray-400 space-y-1">
            {task.subtasks.map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-600">○</span>
                {st}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
