import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drag_and_drop_lists/drag_and_drop_lists.dart';
import 'package:intl/intl.dart';

import '../../models/board.dart';
import '../../models/column.dart' as board_column;
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../tasks/task_detail_screen.dart';
import '../tasks/create_task_screen.dart';

class KanbanBoardScreen extends ConsumerStatefulWidget {
  final String boardId;
  final String boardName;

  const KanbanBoardScreen({
    Key? key,
    required this.boardId,
    required this.boardName,
  }) : super(key: key);

  @override
  ConsumerState<KanbanBoardScreen> createState() => _KanbanBoardScreenState();
}

class _KanbanBoardScreenState extends ConsumerState<KanbanBoardScreen> {
  bool _isLoading = true;
  List<board_column.BoardColumn> _columns = [];
  Map<String, List<Task>> _columnTasks = {};
  List<DragAndDropList> _dragAndDropLists = [];

  @override
  void initState() {
    super.initState();
    _loadBoardData();
  }

  Future<void> _loadBoardData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Panoyu ve sütunları yükle
      final board = await ref.read(projectsProvider.notifier).getBoardDetail(widget.boardId);
      
      if (board != null && board.columns != null) {
        setState(() {
          _columns = board.columns!;
        });

        // Her sütun için görevleri yükle
        for (final column in _columns) {
          final tasks = await ref.read(tasksProvider.notifier).getTasksByColumn(column.id);
          _columnTasks[column.id] = tasks;
        }

        // Drag and drop listelerini oluştur
        _buildDragAndDropLists();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Pano yüklenirken hata oluştu: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _buildDragAndDropLists() {
    _dragAndDropLists = _columns.map((column) {
      final tasks = _columnTasks[column.id] ?? [];
      
      return DragAndDropList(
        header: _buildColumnHeader(column),
        children: tasks.map((task) => _buildTaskItem(task, column.id)).toList(),
        canDrag: false, // Sütunların sürüklenmesini engelle
      );
    }).toList();
  }

  Widget _buildColumnHeader(board_column.BoardColumn column) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              column.name,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: () => _addTaskToColumn(column.id),
            tooltip: 'Görev Ekle',
            constraints: const BoxConstraints(),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  DragAndDropItem _buildTaskItem(Task task, String columnId) {
    return DragAndDropItem(
      child: Card(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        child: InkWell(
          onTap: () => _openTaskDetail(task),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        task.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    if (task.priority != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getPriorityColor(task.priority),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _getPriorityText(task.priority),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                          ),
                        ),
                      ),
                  ],
                ),
                if (task.description != null && task.description!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    task.description!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[700],
                    ),
                  ),
                ],
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (task.dueDate != null)
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 12, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            DateFormat('dd/MM/yyyy').format(task.dueDate!),
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    if (task.assignee != null)
                      CircleAvatar(
                        radius: 10,
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        backgroundImage: task.assignee?.avatarUrl != null
                            ? NetworkImage(task.assignee!.avatarUrl!)
                            : null,
                        child: task.assignee?.avatarUrl == null
                            ? Text(
                                task.assignee!.name[0].toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              )
                            : null,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _onItemReorder(int oldItemIndex, int oldListIndex, int newItemIndex, int newListIndex) async {
    setState(() {
      // Geçici olarak UI'ı güncelle
      final movedItem = _dragAndDropLists[oldListIndex].children.removeAt(oldItemIndex);
      _dragAndDropLists[newListIndex].children.insert(newItemIndex, movedItem);
    });

    try {
      // Taşınan görev ve hedef sütun bilgilerini al
      final sourceColumnId = _columns[oldListIndex].id;
      final targetColumnId = _columns[newListIndex].id;
      final task = _columnTasks[sourceColumnId]![oldItemIndex];

      // Görevin sütununu güncelle
      final updatedTask = await ref.read(tasksProvider.notifier).updateTask(
        task.id,
        {
          'column_id': targetColumnId,
          'order_index': newItemIndex,
        },
      );

      if (updatedTask != null) {
        // Veri yapılarını güncelle
        setState(() {
          _columnTasks[sourceColumnId]!.removeAt(oldItemIndex);
          _columnTasks[targetColumnId]!.insert(newItemIndex, updatedTask);
        });
      }
    } catch (e) {
      // Hata durumunda kullanıcıya bildir ve veriyi yeniden yükle
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Görev taşınırken hata oluştu: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        _loadBoardData(); // Veriyi yeniden yükle
      }
    }
  }

  void _addTaskToColumn(String columnId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreateTaskScreen(columnId: columnId),
      ),
    ).then((_) => _loadBoardData());
  }

  void _openTaskDetail(Task task) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => TaskDetailScreen(task: task),
      ),
    ).then((_) => _loadBoardData());
  }

  void _addNewColumn() {
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Sütun Ekle'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Sütun Adı',
            hintText: 'Örn: Yapılacaklar, Devam Edenler, Tamamlananlar',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;

              Navigator.pop(context);
              setState(() {
                _isLoading = true;
              });

              try {
                final newColumn = await ref.read(projectsProvider.notifier).createColumn(
                  widget.boardId,
                  name,
                );

                if (newColumn != null) {
                  await _loadBoardData();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Sütun eklenirken hata oluştu: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  setState(() {
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Ekle'),
          ),
        ],
      ),
    );
  }

  Color _getPriorityColor(String? priority) {
    switch (priority) {
      case 'low':
        return Colors.green;
      case 'medium':
        return Colors.blue;
      case 'high':
        return Colors.orange;
      case 'urgent':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getPriorityText(String? priority) {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      case 'urgent':
        return 'Acil';
      default:
        return 'Belirsiz';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.boardName),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _addNewColumn,
            tooltip: 'Sütun Ekle',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBoardData,
            tooltip: 'Yenile',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _columns.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.view_column,
                        size: 64,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Bu panoda henüz sütun bulunmuyor',
                        style: TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _addNewColumn,
                        icon: const Icon(Icons.add),
                        label: const Text('Sütun Ekle'),
                      ),
                    ],
                  ),
                )
              : DragAndDropLists(
                  children: _dragAndDropLists,
                  onItemReorder: _onItemReorder,
                  onListReorder: (_, __) {}, // Sütun sıralamasını değiştirmeyi devre dışı bırak
                  listPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  listDraggingWidth: 300,
                  listDecoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  axis: Axis.horizontal,
                  listWidth: 280,
                  contentsWhenEmpty: const Center(
                    child: Text('Bu sütunda görev bulunmuyor'),
                  ),
                ),
    );
  }
}
