import 'task.dart';

class BoardColumn {
  final String id;
  final String name;
  final String boardId;
  final int orderIndex;
  final List<Task>? tasks;
  final DateTime createdAt;
  final DateTime updatedAt;

  BoardColumn({
    required this.id,
    required this.name,
    required this.boardId,
    required this.orderIndex,
    this.tasks,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BoardColumn.fromJson(Map<String, dynamic> json) {
    List<Task>? tasksList;
    if (json['tasks'] != null) {
      tasksList = (json['tasks'] as List)
          .map((taskJson) => Task.fromJson(taskJson))
          .toList();
    }

    return BoardColumn(
      id: json['id'].toString(),
      name: json['name'],
      boardId: json['board_id'].toString(),
      orderIndex: json['order_index'] != null ? json['order_index'] : 0,
      tasks: tasksList,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'board_id': boardId,
      'order_index': orderIndex,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
