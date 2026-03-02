import { create } from 'zustand';
import { Project, User, Board, Column, Task } from '../types';
import { useAuthStore } from './authStore';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  selectedBoard: Board | null;
  loading: boolean;
  
  fetchProjects: (teamId?: string) => Promise<Project[]>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  setSelectedBoard: (board: Board | null) => void;
  
  // Board actions
  createBoard: (projectId: string, name: string) => Promise<Board>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<Board>;
  deleteBoard: (boardId: string) => Promise<void>;
  
  // Column actions
  createColumn: (boardId: string, name: string) => Promise<Column>;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<Column>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (boardId: string, columnIds: string[]) => Promise<void>;
  
  // Task actions
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, destinationColumnId: string, order: number) => Promise<Task>;
}

const API_URL = 'http://localhost:5000/api';

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  selectedBoard: null,
  loading: false,
  
  fetchProjects: async (teamId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const url = teamId 
        ? `${API_URL}/projects?teamId=${teamId}`
        : `${API_URL}/projects`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }
    
      const projects = await response.json();
      set({ projects, loading: false });
      return projects;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  createProject: async (project) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        throw new Error('Failed to create project');
    }
      const newProject = await response.json();
      // Fetch full project details (with members)
      const detailRes = await fetch(`${API_URL}/projects/${newProject.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const fullProject = await detailRes.json();
      // Create a default board for the new project
      const boardResponse = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
            },
        body: JSON.stringify({
          name: 'Main Board',
          project_id: newProject.id,
        }),
      });
      if (!boardResponse.ok) {
        throw new Error('Failed to create default board');
      }
      const defaultBoard = await boardResponse.json();
      // Add the board to the project
      const projectWithBoard = {
        ...fullProject,
        boards: [defaultBoard],
        members: fullProject.members || [],
      };
    set(state => ({
        projects: [
          ...state.projects,
          projectWithBoard
        ],
        selectedProject: projectWithBoard,
        selectedBoard: defaultBoard,
      loading: false,
    }));
      return projectWithBoard;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  updateProject: async (projectId, updates) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      const updatedProject = await response.json();
    
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId ? updatedProject : p
        ),
        selectedProject: state.selectedProject?.id === projectId 
          ? updatedProject 
          : state.selectedProject,
        loading: false,
      }));
    
    return updatedProject;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  deleteProject: async (projectId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
    
    set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId 
          ? null 
          : state.selectedProject,
        selectedBoard: state.selectedBoard?.projectId === projectId 
          ? null 
          : state.selectedBoard,
      loading: false,
    }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  setSelectedProject: (project) => {
    set({ 
      selectedProject: project,
      selectedBoard: project ? project.boards[0] || null : null
    });
  },
  
  setSelectedBoard: (board) => {
    set({ selectedBoard: board });
  },
  
  // Board actions
  createBoard: async (projectId, name) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          project_id: projectId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create board');
      }
      
      const newBoard = await response.json();
      
      // Ensure the board has a columns array
      if (!newBoard.columns) {
        newBoard.columns = [];
      }
      
      set(state => ({
        projects: state.projects.map(project => {
        if (project.id === projectId) {
            return {
            ...project,
              boards: [...(project.boards || []), newBoard],
          };
        }
        return project;
        }),
        selectedProject: state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              boards: [...(state.selectedProject.boards || []), newBoard],
            }
          : state.selectedProject,
        selectedBoard: newBoard,
        loading: false,
      }));
    
    return newBoard;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  updateBoard: async (boardId, updates) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
        
      if (!response.ok) {
        throw new Error('Failed to update board');
      }
      
      const updatedBoard = await response.json();
      
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: project.boards.map(board =>
            board.id === boardId ? updatedBoard : board
          ),
        })),
        selectedBoard: state.selectedBoard?.id === boardId
          ? updatedBoard
          : state.selectedBoard,
        loading: false,
      }));
    
    return updatedBoard;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  deleteBoard: async (boardId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete board');
      }
      
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: project.boards.filter(board => board.id !== boardId),
        })),
        selectedBoard: state.selectedBoard?.id === boardId
          ? null
          : state.selectedBoard,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  // Column actions
  createColumn: async (boardId, name) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      // Find current columns to determine order_index
      const state = get();
      const board = state.selectedBoard || state.projects.flatMap(p => p.boards).find(b => b.id === boardId);
      const order_index = board && board.columns ? board.columns.length : 0;
      const response = await fetch(`${API_URL}/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
          board_id: boardId,
          order_index,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create column');
      }
      const newColumn = await response.json();
      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          boards: project.boards.map(board => {
            if (board.id === boardId) {
              return {
            ...board,
            columns: [...board.columns, newColumn],
              };
            }
            return board;
          }),
        })),
        selectedBoard: state.selectedBoard?.id === boardId
          ? {
              ...state.selectedBoard,
              columns: [...state.selectedBoard.columns, newColumn],
            }
          : state.selectedBoard,
        loading: false,
      }));
    return newColumn;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  updateColumn: async (columnId, updates) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
          
      if (!response.ok) {
        throw new Error('Failed to update column');
      }
      
      const updatedColumn = await response.json();
      
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: project.boards.map(board => ({
            ...board,
            columns: board.columns.map(column =>
              column.id === columnId ? updatedColumn : column
            ),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
              columns: state.selectedBoard.columns.map(column =>
                column.id === columnId ? updatedColumn : column
              ),
            }
          : null,
        loading: false,
      }));
    
    return updatedColumn;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  deleteColumn: async (columnId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
        
      const response = await fetch(`${API_URL}/columns/${columnId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete column');
      }
      
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: project.boards.map(board => ({
            ...board,
            columns: board.columns.filter(column => column.id !== columnId),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
              columns: state.selectedBoard.columns.filter(
                column => column.id !== columnId
              ),
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  reorderColumns: async (boardId, columnIds) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch(`${API_URL}/columns/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          boardId,
          columnIds,
        }),
      });
        
      if (!response.ok) {
        throw new Error('Failed to reorder columns');
      }
      
      const updatedColumns = await response.json();
      
      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          boards: project.boards.map(board => {
            if (board.id === boardId) {
            return {
            ...board,
                columns: updatedColumns,
              };
            }
            return board;
          }),
        })),
        selectedBoard: state.selectedBoard?.id === boardId
          ? {
              ...state.selectedBoard,
              columns: updatedColumns,
            }
          : state.selectedBoard,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  // Task actions
  createTask: async (task) => {
    set({ loading: true });
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');

      // Transform frontend fields to backend format
      const backendTask = {
        ...task,
        column_id: task.columnId,
        due_date: task.dueDate,
        assignee_id: task.assigneeId
      };

      // Remove frontend-specific fields
      delete backendTask.columnId;
      delete backendTask.dueDate;
      delete backendTask.assigneeId;

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendTask),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
    }
      const newTask = await response.json();

      // Transform backend response to frontend format
      const transformedTask = {
        ...newTask,
        columnId: newTask.column_id,
        dueDate: newTask.due_date,
        assigneeId: newTask.assignee_id,
        attachments: [],
        comments: []
      };

      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          boards: (project.boards || []).map(board => ({
            ...board,
            columns: (board.columns || []).map(column => {
            if (column.id === task.columnId) {
              return {
                ...column,
                  tasks: [...(column.tasks || []), transformedTask],
              };
            }
            return column;
            }),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
              columns: (state.selectedBoard.columns || []).map(column => ({
                    ...column,
                tasks: [...(column.tasks || []), transformedTask],
              })),
            }
          : null,
        loading: false,
      }));
      return transformedTask;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  updateTask: async (taskId, updates) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
      
      // Find the current task and its column before update
      const currentState = get();
      let currentTask: Task | null = null;
      let currentColumnId: string | null = null;

      // Search through all projects to find the task and its column
      currentState.projects.forEach(project => {
        project.boards?.forEach(board => {
          board.columns?.forEach(column => {
            const task = column.tasks?.find(t => t.id === taskId);
            if (task) {
              currentTask = task;
              currentColumnId = column.id;
            }
          });
        });
      });

      if (!currentTask || !currentColumnId) {
        console.error('Task or column not found in current state');
        throw new Error('Task not found');
      }

      console.log('Found current task:', { currentTask, currentColumnId });

      // Transform frontend fields to backend format
      const backendUpdates = {
        ...updates,
        due_date: updates.dueDate,
        column_id: updates.columnId || currentColumnId
      };

      // Remove frontend-specific fields
      delete backendUpdates.dueDate;
      delete backendUpdates.columnId;
        
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendUpdates),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update task:', errorText);
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      
      // Transform backend response to frontend format
      const transformedTask = {
        ...updatedTask,
        columnId: updatedTask.column_id,
        dueDate: updatedTask.due_date,
        assigneeId: updatedTask.assignee_id
      };
      
      console.log('Transformed task:', transformedTask);

      set(state => {
        const newState = {
        projects: state.projects.map(project => ({
            ...project,
            boards: (project.boards || []).map(board => ({
            ...board,
              columns: (board.columns || []).map(column => ({
              ...column,
                tasks: (column.tasks || [])
                  .filter(task => task.id !== taskId)
                  .concat(column.id === updatedTask.column_id ? [transformedTask] : [])
            })),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
                columns: (state.selectedBoard.columns || []).map(column => ({
                ...column,
                  tasks: (column.tasks || [])
                    .filter(task => task.id !== taskId)
                    .concat(column.id === updatedTask.column_id ? [transformedTask] : [])
              })),
            }
          : null,
        loading: false,
        };

        console.log('New state after update:', {
          projectsWithTask: newState.projects
            .flatMap(p => p.boards || [])
            .flatMap(b => b.columns || [])
            .flatMap(c => c.tasks || [])
            .filter(t => t.id === taskId),
          selectedBoardTasks: newState.selectedBoard?.columns
            .flatMap(c => c.tasks || [])
            .filter(t => t.id === taskId)
        });
    
        return newState;
      });
    
      return transformedTask;
    } catch (error) {
      console.error('Error in updateTask:', error);
      set({ loading: false });
      throw error;
    }
  },
  
  deleteTask: async (taskId) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
          
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
          });
          
      if (!response.ok) {
        throw new Error('Failed to delete task');
          }
          
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: (project.boards || []).map(board => ({
            ...board,
            columns: (board.columns || []).map(column => ({
              ...column,
              tasks: (column.tasks || []).filter(task => task.id !== taskId),
            })),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
              columns: (state.selectedBoard.columns || []).map(column => ({
                ...column,
                tasks: (column.tasks || []).filter(task => task.id !== taskId),
              })),
        }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  moveTask: async (taskId, destinationColumnId, order) => {
    set({ loading: true });
    
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error('No authentication token');
        
      const response = await fetch(`${API_URL}/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
                columnId: destinationColumnId,
                order,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move task');
      }
      
      const updatedTask = await response.json();
      
      set(state => ({
        projects: state.projects.map(project => ({
            ...project,
          boards: (project.boards || []).map(board => ({
            ...board,
            columns: (board.columns || []).map(column => ({
              ...column,
              tasks: (column.tasks || [])
                .filter(task => task.id !== taskId)
                .concat(column.id === destinationColumnId ? [updatedTask] : []),
            })),
          })),
        })),
        selectedBoard: state.selectedBoard
          ? {
              ...state.selectedBoard,
              columns: (state.selectedBoard.columns || []).map(column => ({
                ...column,
                tasks: (column.tasks || [])
                  .filter(task => task.id !== taskId)
                  .concat(column.id === destinationColumnId ? [updatedTask] : []),
              })),
            }
          : null,
        loading: false,
      }));
    
      return updatedTask;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));