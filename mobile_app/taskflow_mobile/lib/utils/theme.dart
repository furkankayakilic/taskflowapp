import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFF3F51B5);
  static const Color accentColor = Color(0xFF536DFE);
  static const Color errorColor = Color(0xFFE53935);
  static const Color warningColor = Color(0xFFFFB74D);
  static const Color successColor = Color(0xFF43A047);
  
  static const Color textPrimaryLight = Color(0xFF212121);
  static const Color textSecondaryLight = Color(0xFF757575);
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFFB0BEC5);
  
  static const Color backgroundLight = Color(0xFFF5F5F5);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  
  static final ThemeData lightTheme = ThemeData(
    primaryColor: primaryColor,
    colorScheme: const ColorScheme.light(
      primary: primaryColor,
      secondary: accentColor,
      error: errorColor,
      background: backgroundLight,
      surface: surfaceLight,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onBackground: textPrimaryLight,
      onSurface: textPrimaryLight,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: backgroundLight,
    appBarTheme: const AppBarTheme(
      backgroundColor: primaryColor,
      foregroundColor: Colors.white,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
    buttonTheme: ButtonThemeData(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      buttonColor: primaryColor,
      textTheme: ButtonTextTheme.primary,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        side: const BorderSide(color: primaryColor),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: primaryColor),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: errorColor),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: textPrimaryLight,
        fontSize: 28,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: TextStyle(
        color: textPrimaryLight,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: TextStyle(
        color: textPrimaryLight,
        fontSize: 20,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: textPrimaryLight,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      titleLarge: TextStyle(
        color: textPrimaryLight,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
      bodyLarge: TextStyle(
        color: textPrimaryLight,
        fontSize: 16,
      ),
      bodyMedium: TextStyle(
        color: textPrimaryLight,
        fontSize: 14,
      ),
      bodySmall: TextStyle(
        color: textSecondaryLight,
        fontSize: 12,
      ),
      titleMedium: TextStyle(
        color: textPrimaryLight,
        fontSize: 16,
      ),
    ),
  );
  
  static final ThemeData darkTheme = ThemeData(
    primaryColor: primaryColor,
    colorScheme: const ColorScheme.dark(
      primary: primaryColor,
      secondary: accentColor,
      error: errorColor,
      background: backgroundDark,
      surface: surfaceDark,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onBackground: textPrimaryDark,
      onSurface: textPrimaryDark,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: backgroundDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: surfaceDark,
      foregroundColor: textPrimaryDark,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: surfaceDark,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    ),
    buttonTheme: ButtonThemeData(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      buttonColor: primaryColor,
      textTheme: ButtonTextTheme.primary,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        foregroundColor: Colors.white,
        backgroundColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: accentColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: accentColor,
        side: const BorderSide(color: accentColor),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceDark,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(color: Colors.grey.shade800),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: accentColor),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: errorColor),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
    textTheme: const TextTheme(
      displayLarge: TextStyle(
        color: textPrimaryDark,
        fontSize: 28,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: TextStyle(
        color: textPrimaryDark,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: TextStyle(
        color: textPrimaryDark,
        fontSize: 20,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: TextStyle(
        color: textPrimaryDark,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
      titleLarge: TextStyle(
        color: textPrimaryDark,
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
      bodyLarge: TextStyle(
        color: textPrimaryDark,
        fontSize: 16,
      ),
      bodyMedium: TextStyle(
        color: textPrimaryDark,
        fontSize: 14,
      ),
      bodySmall: TextStyle(
        color: textSecondaryDark,
        fontSize: 12,
      ),
      titleMedium: TextStyle(
        color: textPrimaryDark,
        fontSize: 16,
      ),
    ),
  );
}
