import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // Token işlemleri
  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }

  Future<void> deleteToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }

  // HTTP istekleri
  Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    final headers = {
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
    return headers;
  }

  Future<dynamic> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  Future<dynamic> post(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    print('API Request to: $baseUrl/$endpoint');
    print('Request data: $data');
    
    final response = await http.post(
      Uri.parse('$baseUrl/$endpoint'),
      headers: {...headers, 'Content-Type': 'application/json'},
      body: json.encode(data),
    );

    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');
    
    return _handleResponse(response);
  }

  Future<dynamic> put(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return _handleResponse(response);
  }

  Future<dynamic> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  dynamic _handleResponse(http.Response response) {
    try {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) return null;
        return json.decode(response.body);
      } else {
        final errorBody = json.decode(response.body);
        final errorMessage = errorBody['message'] ?? 'Bir hata oluştu';
        throw Exception(errorMessage);
      }
    } catch (e) {
      if (e is FormatException) {
        throw Exception('Backend sunucusuna bağlanılamadı. Lütfen backend sunucusunun çalıştığından emin olun.');
      }
      rethrow;
    }
  }
}
