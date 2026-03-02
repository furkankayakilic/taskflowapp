class User {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      avatarUrl: json['avatar_url'],  // API'de avatar_url olarak geliyor
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : null,
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar_url': avatarUrl,
      'created_at': createdAt?.toIso8601String(),  // Null check ekledik
      'updated_at': updatedAt?.toIso8601String(),  // Null check ekledik
    };
  }

  @override
  String toString() {
    return 'User{id: $id, name: $name, email: $email, avatarUrl: $avatarUrl, createdAt: $createdAt, updatedAt: $updatedAt}';  
  }
}
