import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  
  // Kullanıcı girişi
  Future<User> login(String email, String password) async {
    try {
      print('1. Login attempt for email: $email');
      
      final response = await _apiService.post('auth/login', {
        'email': email,
        'password': password,
      });
      
      print('2. Response type: ${response.runtimeType}');
      print('3. Raw response: $response');
      
      if (response == null) {
        throw Exception('API yanıtı boş');
      }
      
      // Token kontrolü
      final token = response['token'];
      print('4. Token type: ${token?.runtimeType}');
      print('4a. Token value: $token');
      
      if (token == null) {
        throw Exception('Token alınamadı');
      }
      
      // User kontrolü
      final userData = response['user'];
      print('5. User data type: ${userData?.runtimeType}');
      print('5a. User data: $userData');
      
      if (userData == null) {
        throw Exception('Kullanıcı bilgileri alınamadı');
      }
      
      // Token kaydetme
      print('6. Saving token...');
      await _apiService.saveToken(token);
      
      // User ID kaydetme
      final userId = userData['id'];
      print('7. User ID type: ${userId?.runtimeType}');
      print('7a. User ID value: $userId');
      
      if (userId == null) {
        throw Exception('Kullanıcı ID alınamadı');
      }
      
      await _secureStorage.write(key: 'user_id', value: userId.toString());
      
      // User parse etme
      print('8. Converting user data to User model');
      print('8a. User data fields: ${userData.keys.toList()}');
      print('8b. User data values: ${userData.values.toList()}');
      
      // API'den gelen kullanıcı verisini düzenle
      final userDataCopy = Map<String, dynamic>.from(userData);
      // Name alanındaki satır sonu karakterlerini temizle
      if (userDataCopy['name'] != null) {
        userDataCopy['name'] = userDataCopy['name'].toString().replaceAll('\n', ' ').trim();
      }
      
      final user = User.fromJson(userDataCopy);
      print('9. Successfully created User model: $user');
      return user;
    } catch (e) {
      throw Exception('Giriş yapılamadı: ${e.toString()}');
    }
  }
  
  // Kullanıcı kaydı
  Future<User> register(String name, String email, String password) async {
    try {
      final response = await _apiService.post('auth/register', {
        'name': name,
        'email': email,
        'password': password,
      });
      
      await _apiService.saveToken(response['token']);
      await _secureStorage.write(key: 'user_id', value: response['user']['id'].toString());
      
      return User.fromJson(response['user']);
    } catch (e) {
      throw Exception('Kayıt oluşturulamadı: ${e.toString()}');
    }
  }
  
  // Kullanıcı çıkışı
  Future<void> logout() async {
    await _apiService.deleteToken();
    await _secureStorage.delete(key: 'user_id');
  }
  
  // Mevcut kullanıcı bilgilerini getir
  Future<User?> getCurrentUser() async {
    try {
      final token = await _apiService.getToken();
      if (token == null) return null;
      
      final response = await _apiService.get('auth/me');
      return User.fromJson(response);
    } catch (e) {
      return null;
    }
  }
  
  // Token kontrolü
  Future<bool> isLoggedIn() async {
    final token = await _apiService.getToken();
    return token != null;
  }
}
