import '../models/task.dart';
import '../models/comment.dart';
import '../models/attachment.dart';
import 'api_service.dart';

class TaskService {
  final ApiService _apiService = ApiService();
  
  // Sütundaki görevleri getir
  Future<List<Task>> getTasksByColumn(String columnId) async {
    try {
      final response = await _apiService.get('tasks?columnId=$columnId');
      return (response as List)
          .map((taskJson) => Task.fromJson(taskJson))
          .toList();
    } catch (e) {
      throw Exception('Görevler getirilemedi: ${e.toString()}');
    }
  }
  
  // Tüm görevleri getir
  Future<List<Task>> getTasks() async {
    try {
      final response = await _apiService.get('tasks');
      
      return (response as List)
          .map((taskJson) => Task.fromJson(taskJson))
          .toList();
    } catch (e) {
      throw Exception('Görevler getirilemedi: ${e.toString()}');
    }
  }
  
  // Tarih aralığına göre görevleri getir
  Future<List<Task>> getTasksByDateRange(DateTime startDate, DateTime endDate) async {
    try {
      final endpoint = 'tasks/calendar?startDate=${startDate.toIso8601String()}&endDate=${endDate.toIso8601String()}';
      final response = await _apiService.get(endpoint);
      
      return (response as List)
          .map((taskJson) => Task.fromJson(taskJson))
          .toList();
    } catch (e) {
      throw Exception('Görevler getirilemedi: ${e.toString()}');
    }
  }
  
  // Görev detaylarını getir
  Future<Task> getTaskDetails(String taskId) async {
    try {
      final response = await _apiService.get('tasks/$taskId');
      return Task.fromJson(response);
    } catch (e) {
      throw Exception('Görev detayları getirilemedi: ${e.toString()}');
    }
  }
  
  // Yeni görev oluştur
  Future<Task> createTask(Map<String, dynamic> taskData) async {
    try {
      final response = await _apiService.post('tasks', taskData);
      return Task.fromJson(response);
    } catch (e) {
      throw Exception('Görev oluşturulamadı: ${e.toString()}');
    }
  }
  
  // Görevi güncelle
  Future<Task> updateTask(String taskId, Map<String, dynamic> updates) async {
    try {
      final response = await _apiService.put('tasks/$taskId', updates);
      return Task.fromJson(response);
    } catch (e) {
      throw Exception('Görev güncellenemedi: ${e.toString()}');
    }
  }
  
  // Görevi sil
  Future<void> deleteTask(String taskId) async {
    try {
      await _apiService.delete('tasks/$taskId');
    } catch (e) {
      throw Exception('Görev silinemedi: ${e.toString()}');
    }
  }
  
  // Görevleri yeniden sırala
  Future<void> reorderTasks(List<Map<String, dynamic>> tasks) async {
    try {
      await _apiService.put('tasks/reorder', {
        'tasks': tasks,
      });
    } catch (e) {
      throw Exception('Görevler yeniden sıralanamadı: ${e.toString()}');
    }
  }
  
  // Görevi taşı
  Future<Task> moveTask(String taskId, String destinationColumnId, int orderIndex) async {
    try {
      final response = await _apiService.put('tasks/$taskId/move', {
        'columnId': destinationColumnId,
        'order': orderIndex,
      });
      return Task.fromJson(response);
    } catch (e) {
      throw Exception('Görev taşınamadı: ${e.toString()}');
    }
  }
  
  // Yorum ekle
  Future<Comment> addComment(String taskId, String content) async {
    try {
      final response = await _apiService.post('comments', {
        'task_id': taskId,
        'content': content,
      });
      return Comment.fromJson(response);
    } catch (e) {
      throw Exception('Yorum eklenemedi: ${e.toString()}');
    }
  }
  
  // Yorumu sil
  Future<void> deleteComment(String commentId) async {
    try {
      await _apiService.delete('comments/$commentId');
    } catch (e) {
      throw Exception('Yorum silinemedi: ${e.toString()}');
    }
  }
  
  // Dosya ekle
  Future<Attachment> addAttachment(String taskId, String name, String url, String type, int size) async {
    try {
      final response = await _apiService.post('attachments', {
        'task_id': taskId,
        'name': name,
        'url': url,
        'type': type,
        'size': size,
      });
      return Attachment.fromJson(response);
    } catch (e) {
      throw Exception('Dosya eklenemedi: ${e.toString()}');
    }
  }
  
  // Dosyayı sil
  Future<void> deleteAttachment(String attachmentId) async {
    try {
      await _apiService.delete('attachments/$attachmentId');
    } catch (e) {
      throw Exception('Dosya silinemedi: ${e.toString()}');
    }
  }
}
