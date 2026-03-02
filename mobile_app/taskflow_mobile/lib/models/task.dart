import 'user.dart';
import 'comment.dart';
import 'attachment.dart';

class Task {
  final String id;
  final String title;
  final String? description;
  final String columnId;
  final String? assigneeId;
  final User? assignee;
  final String? createdById;
  final User? createdBy;
  final DateTime? dueDate;
  final String? priority;
  final int orderIndex;
  final List<Comment>? comments;
  final List<Attachment>? attachments;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.columnId,
    this.assigneeId,
    this.assignee,
    this.createdById,
    this.createdBy,
    this.dueDate,
    this.priority,
    required this.orderIndex,
    this.comments,
    this.attachments,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    List<Comment>? commentsList;
    if (json['comments'] != null) {
      commentsList = (json['comments'] as List)
          .map((commentJson) => Comment.fromJson(commentJson))
          .toList();
    }

    List<Attachment>? attachmentsList;
    if (json['attachments'] != null) {
      attachmentsList = (json['attachments'] as List)
          .map((attachmentJson) => Attachment.fromJson(attachmentJson))
          .toList();
    }

    return Task(
      id: json['id'].toString(),
      title: json['title'],
      description: json['description'],
      columnId: json['column_id'].toString(),
      assigneeId: json['assignee_id']?.toString(),
      assignee: json['assignee'] != null ? User.fromJson(json['assignee']) : null,
      createdById: json['created_by']?.toString(),
      createdBy: json['created_by_user'] != null ? User.fromJson(json['created_by_user']) : null,
      dueDate: json['due_date'] != null ? DateTime.parse(json['due_date']) : null,
      priority: json['priority'],
      orderIndex: json['order_index'] != null ? json['order_index'] : 0,
      comments: commentsList,
      attachments: attachmentsList,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'column_id': columnId,
      'assignee_id': assigneeId,
      'created_by': createdById,
      'due_date': dueDate?.toIso8601String(),
      'priority': priority,
      'order_index': orderIndex,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
