import 'user.dart';

class Attachment {
  final String id;
  final String taskId;
  final String name;
  final String url;
  final String? type;
  final int? size;
  final String? uploadedById;
  final User? uploadedBy;
  final DateTime uploadedAt;

  Attachment({
    required this.id,
    required this.taskId,
    required this.name,
    required this.url,
    this.type,
    this.size,
    this.uploadedById,
    this.uploadedBy,
    required this.uploadedAt,
  });

  factory Attachment.fromJson(Map<String, dynamic> json) {
    return Attachment(
      id: json['id'].toString(),
      taskId: json['task_id'].toString(),
      name: json['name'],
      url: json['url'],
      type: json['type'],
      size: json['size'],
      uploadedById: json['uploaded_by']?.toString(),
      uploadedBy: json['uploaded_by_user'] != null ? User.fromJson(json['uploaded_by_user']) : null,
      uploadedAt: DateTime.parse(json['uploaded_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'task_id': taskId,
      'name': name,
      'url': url,
      'type': type,
      'size': size,
      'uploaded_by': uploadedById,
      'uploaded_at': uploadedAt.toIso8601String(),
    };
  }
}
