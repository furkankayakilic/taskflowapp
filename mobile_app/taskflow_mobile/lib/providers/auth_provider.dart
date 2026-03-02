import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

// AuthService provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// Kullanıcı durumu provider'ı
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Auth durumu
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error, // Null check ekliyoruz
    );
  }
  
  @override
  String toString() {
    return 'AuthState{user: $user, isLoading: $isLoading, error: $error}';
  }
}

// Auth state notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    state = state.copyWith(isLoading: true);
    try {
      final user = await _authService.getCurrentUser();
      state = AuthState(user: user, isLoading: false);
    } catch (e) {
      state = AuthState(error: e.toString(), isLoading: false);
    }
  }

  Future<void> login(String email, String password) async {
    print('AuthNotifier: Login başlıyor');
    state = state.copyWith(isLoading: true, error: null);
    try {
      print('AuthNotifier: AuthService.login çağrılıyor');
      final user = await _authService.login(email, password);
      print('AuthNotifier: Login başarılı, user: $user');
      state = state.copyWith(user: user, isLoading: false, error: null);
      print('AuthNotifier: State güncellendi, yeni state: user=${state.user}, error=${state.error}, isLoading=${state.isLoading}');
    } catch (e) {
      print('AuthNotifier: Login hatası: ${e.toString()}');
      state = state.copyWith(error: e.toString(), isLoading: false);
      print('AuthNotifier: Hata state güncellendi, error=${state.error}');
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.register(name, email, password);
      state = AuthState(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _authService.logout();
      state = AuthState(isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}
