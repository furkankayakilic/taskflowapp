import 'column.dart';

class Board {
  final String id;
  final String name;
  final String projectId;
  final int orderIndex;
  final List<BoardColumn>? columns;
  final DateTime createdAt;
  final DateTime updatedAt;

  Board({
    required this.id,
    required this.name,
    required this.projectId,
    required this.orderIndex,
    this.columns,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Board.fromJson(Map<String, dynamic> json) {
    print('Board.fromJson başlıyor. JSON: $json');
    
    List<BoardColumn>? columnsList;
    if (json['columns'] != null) {
      try {
        columnsList = (json['columns'] as List)
            .map((columnJson) => BoardColumn.fromJson(columnJson as Map<String, dynamic>))
            .where((column) => column != null)
            .toList();
      } catch (e) {
        print('Columns parse hatası: $e');
        columnsList = [];
      }
    }

    try {
      final orderIndex = json['order_index'];
      print('order_index değeri: $orderIndex, tipi: ${orderIndex?.runtimeType}');
      
      return Board(
        id: json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? 'İsimsiz Pano',
        projectId: json['project_id']?.toString() ?? '',
        orderIndex: orderIndex is int ? orderIndex : 0,
        columns: columnsList,
        createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'].toString()) : DateTime.now(),
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'].toString()) : DateTime.now(),
      );
    } catch (e) {
      print('Board oluşturma hatası: $e');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'project_id': projectId,
      'order_index': orderIndex,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Board copyWith({
    String? id,
    String? name,
    String? projectId,
    int? orderIndex,
    List<BoardColumn>? columns,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Board(
      id: id ?? this.id,
      name: name ?? this.name,
      projectId: projectId ?? this.projectId,
      orderIndex: orderIndex ?? this.orderIndex,
      columns: columns ?? this.columns,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
