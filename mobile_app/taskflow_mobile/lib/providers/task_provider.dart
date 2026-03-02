import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/task.dart';
import '../models/comment.dart';
import '../models/attachment.dart';
import '../services/task_service.dart';

// TaskService provider
final taskServiceProvider = Provider<TaskService>((ref) {
  return TaskService();
});

// Görevler provider'ı
final tasksProvider = StateNotifierProvider<TasksNotifier, TasksState>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  return TasksNotifier(taskService);
});

// Seçili görev provider'ı
final selectedTaskProvider = StateProvider<Task?>((ref) => null);

// Görevler durumu
class TasksState {
  final List<Task> tasks;
  final bool isLoading;
  final String? error;

  TasksState({
    this.tasks = const [],
    this.isLoading = false,
    this.error,
  });

  TasksState copyWith({
    List<Task>? tasks,
    bool? isLoading,
    String? error,
  }) {
    return TasksState(
      tasks: tasks ?? this.tasks,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Görevler state notifier
class TasksNotifier extends StateNotifier<TasksState> {
  final TaskService _taskService;

  TasksNotifier(this._taskService) : super(TasksState());

  Future<List<Task>> getTasksByColumn(String columnId) async {
    try {
      final tasks = await _taskService.getTasksByColumn(columnId);
      return tasks;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return [];
    }
  }
  Future<void> fetchTasks() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final tasks = await _taskService.getTasks();
      state = state.copyWith(tasks: tasks, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> fetchTasksByDateRange(DateTime startDate, DateTime endDate) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final tasks = await _taskService.getTasksByDateRange(startDate, endDate);
      state = state.copyWith(tasks: tasks, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<Task?> createTask(Map<String, dynamic> taskData) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final newTask = await _taskService.createTask(taskData);
      state = state.copyWith(
        tasks: [...state.tasks, newTask],
        isLoading: false,
      );
      return newTask;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<Task?> updateTask(String taskId, Map<String, dynamic> updates) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final updatedTask = await _taskService.updateTask(taskId, updates);
      state = state.copyWith(
        tasks: state.tasks.map((task) => 
          task.id == taskId ? updatedTask : task
        ).toList(),
        isLoading: false,
      );
      return updatedTask;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<bool> deleteTask(String taskId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _taskService.deleteTask(taskId);
      state = state.copyWith(
        tasks: state.tasks.where((task) => task.id != taskId).toList(),
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }

  Future<Task?> moveTask(String taskId, String destinationColumnId, int orderIndex) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final movedTask = await _taskService.moveTask(taskId, destinationColumnId, orderIndex);
      state = state.copyWith(
        tasks: state.tasks.map((task) => 
          task.id == taskId ? movedTask : task
        ).toList(),
        isLoading: false,
      );
      return movedTask;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<Comment?> addComment(String taskId, String content) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final newComment = await _taskService.addComment(taskId, content);
      
      // Görevleri güncelle
      state = state.copyWith(
        tasks: state.tasks.map((task) {
          if (task.id == taskId) {
            final List<Comment> updatedComments = [...(task.comments ?? []), newComment];
            return Task(
              id: task.id,
              title: task.title,
              description: task.description,
              columnId: task.columnId,
              assigneeId: task.assigneeId,
              assignee: task.assignee,
              createdById: task.createdById,
              createdBy: task.createdBy,
              dueDate: task.dueDate,
              priority: task.priority,
              orderIndex: task.orderIndex,
              comments: updatedComments,
              attachments: task.attachments,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            );
          }
          return task;
        }).toList(),
        isLoading: false,
      );
      
      return newComment;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<bool> deleteComment(String taskId, String commentId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _taskService.deleteComment(commentId);
      
      // Görevleri güncelle
      state = state.copyWith(
        tasks: state.tasks.map((task) {
          if (task.id == taskId) {
            final List<Comment> updatedComments = task.comments?.where((comment) => comment.id != commentId).toList() ?? [];
            return Task(
              id: task.id,
              title: task.title,
              description: task.description,
              columnId: task.columnId,
              assigneeId: task.assigneeId,
              assignee: task.assignee,
              createdById: task.createdById,
              createdBy: task.createdBy,
              dueDate: task.dueDate,
              priority: task.priority,
              orderIndex: task.orderIndex,
              comments: updatedComments,
              attachments: task.attachments,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            );
          }
          return task;
        }).toList(),
        isLoading: false,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }
}
