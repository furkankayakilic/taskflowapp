import 'user.dart';

class Comment {
  final String id;
  final String content;
  final String taskId;
  final String userId;
  final User? user;
  final DateTime createdAt;
  final DateTime updatedAt;

  Comment({
    required this.id,
    required this.content,
    required this.taskId,
    required this.userId,
    this.user,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'].toString(),
      content: json['content'],
      taskId: json['task_id'].toString(),
      userId: json['user_id'].toString(),
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'task_id': taskId,
      'user_id': userId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
