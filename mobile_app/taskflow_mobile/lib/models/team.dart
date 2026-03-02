import 'user.dart';

class Team {
  final String id;
  final String name;
  final String? description;
  final List<User>? members;
  final DateTime createdAt;
  final DateTime updatedAt;

  Team({
    required this.id,
    required this.name,
    this.description,
    this.members,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    List<User>? membersList;
    if (json['members'] != null) {
      membersList = (json['members'] as List)
          .map((memberJson) => User.fromJson(memberJson))
          .toList();
    }

    return Team(
      id: json['id'].toString(),
      name: json['name'],
      description: json['description'],
      members: membersList,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
