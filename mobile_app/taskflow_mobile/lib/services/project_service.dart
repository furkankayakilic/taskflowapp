import '../models/project.dart';
import '../models/board.dart';
import '../models/column.dart';
import '../models/task.dart';
import 'api_service.dart';

class ProjectService {
  final ApiService _apiService = ApiService();
  
  // Projeleri getir
  Future<List<Project>> getProjects({String? teamId}) async {
    try {
      print('1. Projeler getiriliyor...');
      final endpoint = teamId != null ? 'projects?teamId=$teamId' : 'projects';
      final response = await _apiService.get(endpoint);
      
      print('2. API yanıtı: $response');
      print('2a. Yanıt tipi: ${response.runtimeType}');
      
      if (response == null) {
        print('3. Yanıt null!');
        return [];
      }
      
      // API yanıtını listeye çevirelim
      List projectsList;
      if (response is List) {
        projectsList = response;
      } else if (response is Map && response.containsKey('projects')) {
        projectsList = response['projects'] as List;
      } else {
        print('4. Yanıt uygun formatta değil');
        return [];
      }
      
      print('5. Projeleri parse etmeye başlıyoruz...');
      final projects = projectsList.map((projectJson) {
        print('6. Proje JSON: $projectJson');
        try {
          return Project.fromJson(projectJson as Map<String, dynamic>);
        } catch (e) {
          print('7. Proje parse hatası: $e');
          return null;
        }
      }).where((project) => project != null).cast<Project>().toList();
      
      print('8. Parse edilen proje sayısı: ${projects.length}');
      return projects;
    } catch (e) {
      print('9. Genel hata: $e');
      throw Exception('Projeler getirilemedi: ${e.toString()}');
    }
  }
  
  // Proje detaylarını getir
  Future<Project> getProjectDetails(String projectId) async {
    try {
      final response = await _apiService.get('projects/$projectId');
      return Project.fromJson(response);
    } catch (e) {
      throw Exception('Proje detayları getirilemedi: ${e.toString()}');
    }
  }
  
  // Yeni proje oluştur
  Future<Project> createProject(Map<String, dynamic> projectData) async {
    try {
      final response = await _apiService.post('projects', projectData);
      return Project.fromJson(response);
    } catch (e) {
      throw Exception('Proje oluşturulamadı: ${e.toString()}');
    }
  }
  
  // Projeyi güncelle
  Future<Project> updateProject(String projectId, Map<String, dynamic> updates) async {
    try {
      final response = await _apiService.put('projects/$projectId', updates);
      return Project.fromJson(response);
    } catch (e) {
      throw Exception('Proje güncellenemedi: ${e.toString()}');
    }
  }
  
  // Projeyi sil
  Future<void> deleteProject(String projectId) async {
    try {
      await _apiService.delete('projects/$projectId');
    } catch (e) {
      throw Exception('Proje silinemedi: ${e.toString()}');
    }
  }
  
  // Pano oluştur
  Future<Board> createBoard(String projectId, String name) async {
    try {
      final response = await _apiService.post('boards', {
        'project_id': projectId,
        'name': name,
      });
      return Board.fromJson(response);
    } catch (e) {
      throw Exception('Pano oluşturulamadı: ${e.toString()}');
    }
  }
  
  // Pano detaylarını getir
  Future<Board> getBoardDetail(String boardId) async {
    try {
      final response = await _apiService.get('boards/$boardId');
      return Board.fromJson(response);
    } catch (e) {
      throw Exception('Pano detayları getirilemedi: ${e.toString()}');
    }
  }

  // Panoyu güncelle
  Future<Board> updateBoard(String boardId, String name) async {
    try {
      final response = await _apiService.put('boards/$boardId', {'name': name});
      return Board.fromJson(response);
    } catch (e) {
      throw Exception('Pano güncellenemedi: ${e.toString()}');
    }
  }
  
  // Panoyu sil
  Future<void> deleteBoard(String boardId) async {
    try {
      await _apiService.delete('boards/$boardId');
    } catch (e) {
      throw Exception('Pano silinemedi: ${e.toString()}');
    }
  }
  
  // Sütun oluştur
  Future<BoardColumn> createColumn(String boardId, String name) async {
    try {
      final response = await _apiService.post('columns', {
        'board_id': boardId,
        'name': name,
      });
      return BoardColumn.fromJson(response);
    } catch (e) {
      throw Exception('Sütun oluşturulamadı: ${e.toString()}');
    }
  }
  
  // Sütunu güncelle
  Future<BoardColumn> updateColumn(String columnId, String name) async {
    try {
      final response = await _apiService.put('columns/$columnId', {'name': name});
      return BoardColumn.fromJson(response);
    } catch (e) {
      throw Exception('Sütun güncellenemedi: ${e.toString()}');
    }
  }
  
  // Sütunu sil
  Future<void> deleteColumn(String columnId) async {
    try {
      await _apiService.delete('columns/$columnId');
    } catch (e) {
      throw Exception('Sütun silinemedi: ${e.toString()}');
    }
  }
  
  // Sütunları yeniden sırala
  Future<void> reorderColumns(String boardId, List<String> columnIds) async {
    try {
      await _apiService.put('columns/reorder', {
        'board_id': boardId,
        'column_ids': columnIds,
      });
    } catch (e) {
      throw Exception('Sütunlar yeniden sıralanamadı: ${e.toString()}');
    }
  }
}
