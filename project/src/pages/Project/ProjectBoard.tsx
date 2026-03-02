import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, ChevronLeft, MoreVertical } from 'lucide-react';
import { BoardColumn } from '../../components/BoardColumn';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { TaskDetailsModal } from '../../components/TaskDetailsModal';
import { Dropdown, DropdownItem, DropdownSelect } from '../../components/ui/Dropdown';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { useTeamStore } from '../../store/teamStore';
import { Task, Column, User } from '../../types';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export function ProjectBoard() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, token } = useAuthStore();
  const { 
    projects, 
    selectedProject,
    selectedBoard,
    setSelectedProject,
    setSelectedBoard,
    fetchProjects,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    deleteProject,
  } = useProjectStore();
  const { teams } = useTeamStore();
  
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isViewTaskModalOpen, setIsViewTaskModalOpen] = useState(false);
  const [currentTaskColumnId, setCurrentTaskColumnId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  const [projectError, setProjectError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProjects();
      setLoading(false);
    };
    load();
  }, [fetchProjects]);
  
  useEffect(() => {
    if (!projectId || loading) return;
    const project = projects.find(p => String(p.id) === String(projectId));
    if (project) {
      setSelectedProject(project);
      if (project.boards.length > 0) {
        setSelectedBoard(project.boards[0]);
      }
      setProjectError(null);
    } else {
      // Debug log
      console.error('Project not found:', { projectId, projects });
      setProjectError(
        `Project not found or could not be loaded.\n
Debug info:\n- projectId: ${projectId}\n- projects in state: ${projects.map(p => p.id).join(', ')}`
      );
    }
  }, [projectId, projects, loading, setSelectedProject, setSelectedBoard]);
  
  const handleAddColumn = async () => {
    if (!selectedBoard || !newColumnName.trim()) return;
    
    await createColumn(selectedBoard.id, newColumnName.trim());
    setNewColumnName('');
    setIsAddColumnModalOpen(false);
  };
  
  const handleEditColumn = (column: Column) => {
    setSelectedColumn(column);
    setNewColumnName(column.name);
    setIsEditColumnModalOpen(true);
  };
  
  const handleUpdateColumn = async () => {
    if (!selectedColumn || !newColumnName.trim() || !selectedBoard) return;
    
    try {
      // Önce backend'e güncelleme isteği gönder
      const updatedColumn = await updateColumn(selectedColumn.id, { 
        name: newColumnName.trim(),
        order_index: selectedColumn.order_index || 0
      });

      // State'i güncelle
      const updatedBoard = {
        ...selectedBoard,
        columns: selectedBoard.columns.map(col => 
          col.id === selectedColumn.id ? updatedColumn : col
        )
      };
      setSelectedBoard(updatedBoard);
      
      // Modal'ı kapat
      setNewColumnName('');
      setSelectedColumn(null);
      setIsEditColumnModalOpen(false);
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    if (window.confirm('Are you sure you want to delete this column and all its tasks?')) {
      await deleteColumn(columnId);
    }
  };
  
  const handleAddTask = (columnId: string) => {
    setCurrentTaskColumnId(columnId);
    setTaskFormData({
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      priority: 'medium',
    });
    setIsAddTaskModalOpen(true);
  };
  
  const handleCreateTask = async () => {
    if (!taskFormData.title.trim() || !currentTaskColumnId) return;
    
    // Format the date properly for PostgreSQL
    const formattedDueDate = taskFormData.dueDate ? new Date(taskFormData.dueDate) : undefined;
    
    await createTask({
      title: taskFormData.title.trim(),
      description: taskFormData.description.trim(),
      columnId: currentTaskColumnId,
      assigneeId: taskFormData.assigneeId || undefined,
      dueDate: formattedDueDate,
      priority: taskFormData.priority,
    });
    setIsAddTaskModalOpen(false);
    setTaskFormData({
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      priority: 'medium',
    });
    await fetchProjects();
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      assigneeId: task.assigneeId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
    });
    setIsEditTaskModalOpen(true);
  };
  
  const handleUpdateTask = async () => {
    if (!selectedTask || !taskFormData.title.trim()) return;
    
    try {
      console.log('Selected task before update:', selectedTask);
      
      // Format the date properly for PostgreSQL
      const formattedDueDate = taskFormData.dueDate ? new Date(taskFormData.dueDate) : undefined;
      
      const updateData = {
      title: taskFormData.title.trim(),
      description: taskFormData.description.trim(),
      assigneeId: taskFormData.assigneeId || undefined,
        dueDate: formattedDueDate,
      priority: taskFormData.priority,
        columnId: selectedTask.columnId // Preserve the column ID
      };

      console.log('Updating task with data:', updateData);

      await updateTask(selectedTask.id, updateData);
    await fetchProjects();

    setSelectedTask(null);
    setIsEditTaskModalOpen(false);

    if (isViewTaskModalOpen) {
      const updatedTask = selectedProject?.boards
        .flatMap(b => b.columns)
        .flatMap(c => c.tasks)
        .find(t => t.id === selectedTask.id);

        console.log('Updated task after fetch:', updatedTask);

      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      // Close details modal if it was open
      if (isViewTaskModalOpen && selectedTask?.id === taskId) {
        setIsViewTaskModalOpen(false);
        setSelectedTask(null);
      }
      // Fetch projects to update the board instantly
      await fetchProjects();
    }
  };
  
  const handleViewTask = async (task: Task) => {
    console.log('Original task:', task);
    // Attachments ve comments'i backend'den çek
    try {
      const [attachmentsRes, commentsRes] = await Promise.all([
        axios.get(`${API_URL}/attachments/task/${task.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/comments/task/${task.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Transform the task data
      const transformedTask = {
        ...task,
        attachments: attachmentsRes.data,
        comments: commentsRes.data.map((c: any) => ({
          ...c,
          user: { id: c.user_id, name: c.user_name, avatarUrl: c.user_avatar },
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      };

      console.log('Transformed task:', transformedTask);
      setSelectedTask(transformedTask);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setSelectedTask({
        ...task,
        attachments: [],
        comments: [],
      });
    }
    setIsViewTaskModalOpen(true);
  };
  
  const handleUpdateTaskAssignee = async (userId?: string) => {
    if (!selectedTask) return;
    
    await updateTask(selectedTask.id, {
      assigneeId: userId,
    });
    
    // Update the selected task
    const updatedTask = selectedProject?.boards
      .flatMap(b => b.columns)
      .flatMap(c => c.tasks)
      .find(t => t.id === selectedTask.id);
    
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
  };
  
  const handleAddComment = async (content: string) => {
    if (!selectedTask || !user) return;
    try {
      const res = await axios.post(
        `${API_URL}/comments`,
        { task_id: selectedTask.id, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Yorumları tekrar çek
      const commentsRes = await axios.get(`${API_URL}/comments/task/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask((prev) => prev && {
        ...prev,
        comments: commentsRes.data.map((c: any) => ({
          ...c,
          user: { id: c.user_id, name: c.user_name, avatarUrl: c.user_avatar },
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      });
    } catch (err) {}
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedTask) return;
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Yorumları tekrar çek
      const commentsRes = await axios.get(`${API_URL}/comments/task/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask((prev) => prev && {
        ...prev,
        comments: commentsRes.data.map((c: any) => ({
          ...c,
          user: { id: c.user_id, name: c.user_name, avatarUrl: c.user_avatar },
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        })),
      });
    } catch (err) {}
  };
  
  const handleAddAttachment = async (file: File) => {
    if (!selectedTask || !user) return;
    // Gerçek dosya yükleme yok, url olarak base64 veya blob kullanılabilir
    // Demo için sadece dosya adını ve url'yi kaydediyoruz
    const url = URL.createObjectURL(file);
    try {
      await axios.post(
        `${API_URL}/attachments`,
        {
          task_id: selectedTask.id,
          name: file.name,
          url,
          type: file.type,
          size: file.size,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Attachments tekrar çek
      const attachmentsRes = await axios.get(`${API_URL}/attachments/task/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask((prev) => prev && {
        ...prev,
        attachments: attachmentsRes.data,
      });
    } catch (err) {}
  };
  
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!selectedTask) return;
    try {
      await axios.delete(`${API_URL}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Attachments tekrar çek
      const attachmentsRes = await axios.get(`${API_URL}/attachments/task/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask((prev) => prev && {
        ...prev,
        attachments: attachmentsRes.data,
      });
    } catch (err) {}
  };
  
  // Get project members
  const projectMembers = (selectedProject?.members || []).map(m => m.user);
  
  // Get team members for assignee dropdown
  const team = teams.find(t => String(t.id) === String(selectedProject?.teamId || (selectedProject as any)?.team_id));
  const teamMembers = (team?.members || []);
  
  // Add handler for deleting the project
  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(selectedProject.id);
      navigate('/projects');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (projectError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md whitespace-pre-line">
          {projectError}
        </div>
        <Button className="mt-4" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }
  
  if (!selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          Project not found or could not be loaded.
        </div>
        <Button className="mt-4" onClick={() => navigate('/projects')}>Back to Projects</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate('/projects')} className="mr-2 text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{selectedProject?.name}</h1>
          
          <Dropdown
            trigger={
              <button className="ml-auto p-2 text-gray-500 hover:text-gray-700">
                <MoreVertical size={20} />
              </button>
            }
            align="right"
          >
            <DropdownItem onClick={() => navigate(`/projects/${projectId}/edit`)}>
              Edit Project
            </DropdownItem>
            <DropdownItem destructive onClick={handleDeleteProject}>Delete Project</DropdownItem>
          </Dropdown>
        </div>
        
        {selectedProject?.description && (
          <p className="text-gray-600 mb-4">{selectedProject.description}</p>
        )}
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddColumnModalOpen(true)}
            startIcon={<Plus size={16} />}
          >
            Add Column
          </Button>
        </div>
      </div>
      
      {/* Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {selectedBoard ? (
            <>
              {(!selectedBoard.columns || selectedBoard.columns.length === 0) ? (
                <div className="flex flex-col items-center justify-center min-w-[280px] h-[120px] bg-gray-50 rounded-md border border-dashed border-gray-300 text-gray-500">
                  <p>No columns yet.</p>
                  <Button
                    className="mt-2"
                    onClick={() => setIsAddColumnModalOpen(true)}
                    startIcon={<Plus size={16} />}
                  >
                    Add Column
                  </Button>
                </div>
              ) : (
                selectedBoard.columns
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((column) => (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onViewTask={handleViewTask}
                      onEditColumn={() => handleEditColumn(column)}
                      onDeleteColumn={handleDeleteColumn}
                    />
                  ))
              )}
              {/* Add Column button her zaman görünür */}
              <button
                onClick={() => setIsAddColumnModalOpen(true)}
                className="min-w-[280px] h-[60px] flex items-center justify-center bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Column
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-w-[280px] h-[120px] bg-gray-50 rounded-md border border-dashed border-gray-300 text-gray-500">
              <p>No board available.</p>
              <Button
                className="mt-2"
                onClick={() => navigate('/projects')}
              >
                Back to Projects
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Column Modal */}
      <Modal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        title="Add Column"
      >
        <div className="space-y-4">
          <Input
            label="Column Name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="e.g. To Do, In Progress, Done"
            fullWidth
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddColumnModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
              Add Column
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Column Modal */}
      <Modal
        isOpen={isEditColumnModalOpen}
        onClose={() => setIsEditColumnModalOpen(false)}
        title="Edit Column"
      >
        <div className="space-y-4">
          <Input
            label="Column Name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="e.g. To Do, In Progress, Done"
            fullWidth
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditColumnModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateColumn} disabled={!newColumnName.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Task"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            placeholder="e.g. Design homepage mockup"
            fullWidth
          />
          
          <Textarea
            label="Description"
            value={taskFormData.description}
            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            placeholder="Add more details about this task..."
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <DropdownSelect
                options={[
                  { label: 'Unassigned', value: '' },
                  ...teamMembers.map((m: any) => ({
                    label: m.name,
                    value: m.id,
                  })),
                ]}
                value={taskFormData.assigneeId}
                onChange={(value) =>
                  setTaskFormData({ ...taskFormData, assigneeId: value })
                }
                placeholder="Select assignee"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <DropdownSelect
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Urgent', value: 'urgent' },
                ]}
                value={taskFormData.priority}
                onChange={(value) =>
                  setTaskFormData({
                    ...taskFormData,
                    priority: value as 'low' | 'medium' | 'high' | 'urgent',
                  })
                }
                placeholder="Select priority"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={taskFormData.dueDate}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, dueDate: e.target.value })
              }
              fullWidth
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!taskFormData.title.trim()}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        title="Edit Task"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={taskFormData.title}
            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
            placeholder="e.g. Design homepage mockup"
            fullWidth
          />
          
          <Textarea
            label="Description"
            value={taskFormData.description}
            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            placeholder="Add more details about this task..."
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <DropdownSelect
                options={[
                  { label: 'Unassigned', value: '' },
                  ...teamMembers.map((m: any) => ({
                    label: m.name,
                    value: m.id,
                  })),
                ]}
                value={taskFormData.assigneeId}
                onChange={(value) =>
                  setTaskFormData({ ...taskFormData, assigneeId: value })
                }
                placeholder="Select assignee"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <DropdownSelect
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Urgent', value: 'urgent' },
                ]}
                value={taskFormData.priority}
                onChange={(value) =>
                  setTaskFormData({
                    ...taskFormData,
                    priority: value as 'low' | 'medium' | 'high' | 'urgent',
                  })
                }
                placeholder="Select priority"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={taskFormData.dueDate}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, dueDate: e.target.value })
              }
              fullWidth
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={!taskFormData.title.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          users={projectMembers}
          isOpen={isViewTaskModalOpen}
          onClose={() => {
            setIsViewTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onEdit={() => {
            setIsViewTaskModalOpen(false);
            handleEditTask(selectedTask);
          }}
          onDelete={() => {
            setIsViewTaskModalOpen(false);
            handleDeleteTask(selectedTask.id);
          }}
          onUpdateAssignee={handleUpdateTaskAssignee}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      )}
    </div>
  );
}