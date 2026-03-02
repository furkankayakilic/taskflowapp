import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'providers/auth_provider.dart';
import 'utils/theme.dart';

void main() {
  runApp(
    const ProviderScope(
      child: TaskflowApp(),
    ),
  );
}

class TaskflowApp extends ConsumerWidget {
  const TaskflowApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    
    return MaterialApp(
      title: 'Taskflow',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      home: authState.isLoading
          ? const SplashScreen()
          : authState.user != null
              ? const HomeScreen()
              : const LoginScreen(),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.task_alt,
              size: 120,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 24),
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            const Text(
              'Taskflow',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
