import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/project.dart';
import '../models/board.dart';
import '../models/column.dart';
import '../services/project_service.dart';

// ProjectService provider
final projectServiceProvider = Provider<ProjectService>((ref) {
  return ProjectService();
});

// Projeler provider'ı
final projectsProvider = StateNotifierProvider<ProjectsNotifier, ProjectsState>((ref) {
  final projectService = ref.watch(projectServiceProvider);
  return ProjectsNotifier(projectService);
});

// Seçili proje provider'ı
final selectedProjectProvider = StateProvider<Project?>((ref) => null);

// Seçili pano provider'ı
final selectedBoardProvider = StateProvider<Board?>((ref) => null);

// Projeler durumu
class ProjectsState {
  final List<Project> projects;
  final bool isLoading;
  final String? error;

  ProjectsState({
    this.projects = const [],
    this.isLoading = false,
    this.error,
  });

  ProjectsState copyWith({
    List<Project>? projects,
    bool? isLoading,
    String? error,
  }) {
    return ProjectsState(
      projects: projects ?? this.projects,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Projeler state notifier
class ProjectsNotifier extends StateNotifier<ProjectsState> {
  final ProjectService _projectService;

  ProjectsNotifier(this._projectService) : super(ProjectsState());

  Future<void> fetchProjects({String? teamId}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final projects = await _projectService.getProjects(teamId: teamId);
      state = state.copyWith(projects: projects, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<Project?> getProjectDetail(String projectId) async {
    try {
      return await _projectService.getProjectDetails(projectId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<Board?> getBoardDetail(String boardId) async {
    try {
      return await _projectService.getBoardDetail(boardId);
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<Board?> createBoard(String projectId, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final newBoard = await _projectService.createBoard(projectId, name);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          if (project.id == projectId) {
            final List<Board> updatedBoards = [...(project.boards ?? []), newBoard];
            return project.copyWith(boards: updatedBoards);
          }
          return project;
        }).toList(),
        isLoading: false,
      );
      
      return newBoard;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<Board?> updateBoard(String boardId, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final updatedBoard = await _projectService.updateBoard(boardId, name);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          final updatedBoards = project.boards?.map((board) {
            if (board.id == boardId) {
              return updatedBoard;
            }
            return board;
          }).toList();
          return project.copyWith(boards: updatedBoards as List<Board>?);
        }).toList(),
        isLoading: false,
      );
      
      return updatedBoard;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<bool> deleteBoard(String boardId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _projectService.deleteBoard(boardId);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          final updatedBoards = project.boards?.where((board) => board.id != boardId).toList();
          return project.copyWith(boards: updatedBoards);
        }).toList(),
        isLoading: false,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }

  Future<BoardColumn?> createColumn(String boardId, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final newColumn = await _projectService.createColumn(boardId, name);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          final updatedBoards = project.boards?.map((board) {
            if (board.id == boardId) {
              final List<BoardColumn> updatedColumns = [...(board.columns ?? []), newColumn];
              return board.copyWith(columns: updatedColumns);
            }
            return board;
          }).toList();
          return project.copyWith(boards: updatedBoards as List<Board>?);
        }).toList(),
        isLoading: false,
      );
      
      return newColumn;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<BoardColumn?> updateColumn(String columnId, String name) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final updatedColumn = await _projectService.updateColumn(columnId, name);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          final updatedBoards = project.boards?.map((board) {
            final updatedColumns = board.columns?.map((column) {
              if (column.id == columnId) {
                return updatedColumn;
              }
              return column;
            }).toList();
            return board.copyWith(columns: updatedColumns as List<BoardColumn>?);
          }).toList();
          return project.copyWith(boards: updatedBoards as List<Board>?);
        }).toList(),
        isLoading: false,
      );
      
      return updatedColumn;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<bool> deleteColumn(String columnId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _projectService.deleteColumn(columnId);
      
      state = state.copyWith(
        projects: state.projects.map((project) {
          final updatedBoards = project.boards?.map((board) {
            final updatedColumns = board.columns?.where((column) => column.id != columnId).toList();
            return board.copyWith(columns: updatedColumns as List<BoardColumn>?);
          }).toList();
          return project.copyWith(boards: updatedBoards as List<Board>?);
        }).toList(),
        isLoading: false,
      );
      
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }

  Future<Project?> createProject(Map<String, dynamic> projectData) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final newProject = await _projectService.createProject(projectData);
      state = state.copyWith(
        projects: [...state.projects, newProject],
        isLoading: false,
      );
      return newProject;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<Project?> updateProject(String projectId, Map<String, dynamic> updates) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final updatedProject = await _projectService.updateProject(projectId, updates);
      state = state.copyWith(
        projects: state.projects.map((project) => 
          project.id == projectId ? updatedProject : project
        ).toList(),
        isLoading: false,
      );
      return updatedProject;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return null;
    }
  }

  Future<bool> deleteProject(String projectId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _projectService.deleteProject(projectId);
      state = state.copyWith(
        projects: state.projects.where((project) => project.id != projectId).toList(),
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }
}
