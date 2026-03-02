import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useProjectStore } from '../../store/projectStore';
import { AvatarGroup } from '../../components/ui/AvatarGroup';

interface TaskWithDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectName: string;
  boardName: string;
  columnName: string;
  assignees: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
}

export function Calendar() {
  const { projects, fetchProjects } = useProjectStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Get all tasks from all projects
  const allTasks: TaskWithDetails[] = (projects || []).flatMap(project =>
    (project.boards || []).flatMap(board =>
      (board.columns || []).flatMap(column =>
        (column.tasks || []).map(task => ({
          ...task,
          dueDate: task.dueDate ? String(task.dueDate) : '',
          projectName: project.name,
          boardName: board.name,
          columnName: column.name,
          assignees: task.assignee ? [task.assignee] : [],
        }))
      )
    )
  );

  // Filter tasks for current month
  const currentMonthTasks = allTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return (
      taskDate.getMonth() === currentDate.getMonth() &&
      taskDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group tasks by date
  const tasksByDate = currentMonthTasks.reduce((acc, task) => {
    const date = new Date(task.dueDate).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, TaskWithDetails[]>);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View and manage your tasks schedule</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-lg font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(tasksByDate).map(([date, tasks]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon size={20} className="mr-2" />
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-500">
                            <Clock size={14} className="mr-1" />
                            {new Date(task.dueDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="flex items-center text-gray-500">
                            <Users size={14} className="mr-1" />
                            {task.assignees.length} assigned
                          </div>
                        </div>
                        <span className="text-gray-500">{task.projectName}</span>
                      </div>

                      {task.assignees.length > 0 && (
                        <div className="mt-3">
                          <AvatarGroup
                            users={task.assignees}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 