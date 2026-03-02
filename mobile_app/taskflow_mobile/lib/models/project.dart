import 'user.dart';
import 'team.dart';
import 'board.dart';

class Project {
  final String id;
  final String name;
  final String? description;
  final String? teamId;
  final Team? team;
  final User? createdBy;
  final List<User>? members;
  final List<Board>? boards;
  final DateTime createdAt;
  final DateTime updatedAt;

  Project({
    required this.id,
    required this.name,
    this.description,
    this.teamId,
    this.team,
    this.createdBy,
    this.members,
    this.boards,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    // Debug bilgisi
    print('Project.fromJson başlıyor. JSON: $json');
    
    List<User>? membersList;
    if (json['members'] != null) {
      try {
        membersList = (json['members'] as List)
            .map((memberJson) => User.fromJson(memberJson as Map<String, dynamic>))
            .where((member) => member != null)
            .toList();
      } catch (e) {
        print('Members parse hatası: $e');
        membersList = [];
      }
    }

    List<Board>? boardsList;
    if (json['boards'] != null) {
      try {
        boardsList = (json['boards'] as List)
            .map((boardJson) => Board.fromJson(boardJson as Map<String, dynamic>))
            .where((board) => board != null)
            .toList();
      } catch (e) {
        print('Boards parse hatası: $e');
        boardsList = [];
      }
    }

    try {
      return Project(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'İsimsiz Proje',
        description: json['description']?.toString(),
        teamId: json['team_id']?.toString(),
        team: json['team'] != null ? Team.fromJson(json['team'] as Map<String, dynamic>) : null,
        createdBy: json['created_by'] != null ? User.fromJson(json['created_by'] as Map<String, dynamic>) : null,
        members: membersList,
        boards: boardsList,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'].toString()) : DateTime.now(),
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'].toString()) : DateTime.now(),
      );
    } catch (e) {
      print('Project oluşturma hatası: $e');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'team_id': teamId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Project copyWith({
    String? id,
    String? name,
    String? description,
    String? teamId,
    Team? team,
    User? createdBy,
    List<User>? members,
    List<Board>? boards,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Project(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      teamId: teamId ?? this.teamId,
      team: team ?? this.team,
      createdBy: createdBy ?? this.createdBy,
      members: members ?? this.members,
      boards: boards ?? this.boards,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
