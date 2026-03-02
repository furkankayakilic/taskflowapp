import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drag_and_drop_lists/drag_and_drop_lists.dart';
import '../../models/board.dart';
import '../../models/column.dart';
import '../../models/task.dart';
import '../../providers/project_provider.dart';
import '../../providers/task_provider.dart';
import 'task_detail_screen.dart';
import 'create_task_screen.dart';

class BoardScreen extends ConsumerStatefulWidget {
  final Board board;

  const BoardScreen({Key? key, required this.board}) : super(key: key);

  @override
  ConsumerState<BoardScreen> createState() => _BoardScreenState();
}

class _BoardScreenState extends ConsumerState<BoardScreen> {
  late Board _board;
  List<DragAndDropList> _lists = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _board = widget.board;
    _initLists();
  }

  void _initLists() {
    if (_board.columns == null || _board.columns!.isEmpty) {
      _lists = [];
      return;
    }

    _lists = _board.columns!.map((column) {
      final children = column.tasks
              ?.map((task) => _buildTaskItem(task, column.id))
              .toList() ??
          [];

      return DragAndDropList(
        header: _buildColumnHeader(column),
        children: children,
        canDrag: false,
      );
    }).toList();
  }

  DragAndDropItem _buildTaskItem(Task task, String columnId) {
    return DragAndDropItem(
      child: TaskCard(
        task: task,
        onTap: () {
          ref.read(selectedTaskProvider.notifier).state = task;
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TaskDetailScreen(task: task),
            ),
          ).then((_) {
            // Ekrandan döndüğünde board'u güncelle
            setState(() {
              _initLists();
            });
          });
        },
      ),
    );
  }

  Widget _buildColumnHeader(BoardColumn column) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              column.name,
              style: Theme.of(context).textTheme.titleMedium,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CreateTaskScreen(columnId: column.id),
                ),
              ).then((_) {
                // Ekrandan döndüğünde board'u güncelle
                setState(() {
                  _initLists();
                });
              });
            },
            tooltip: 'Görev Ekle',
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {
              _showColumnOptions(column);
            },
            tooltip: 'Seçenekler',
          ),
        ],
      ),
    );
  }

  void _showColumnOptions(BoardColumn column) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('Sütunu Düzenle'),
            onTap: () {
              Navigator.pop(context);
              _showEditColumnDialog(column);
            },
          ),
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: const Text('Sütunu Sil', style: TextStyle(color: Colors.red)),
            onTap: () {
              Navigator.pop(context);
              _showDeleteColumnConfirmation(column);
            },
          ),
        ],
      ),
    );
  }

  void _showEditColumnDialog(BoardColumn column) {
    final nameController = TextEditingController(text: column.name);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sütunu Düzenle'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Sütun Adı',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final newName = nameController.text.trim();
              if (newName.isNotEmpty) {
                setState(() {
                  _isLoading = true;
                });
                try {
                  await ref.read(projectsProvider.notifier).updateColumn(
                    column.id,
                    newName,
                  );
                  if (!mounted) return;
                  Navigator.pop(context);
                  setState(() {
                    _isLoading = false;
                    _initLists();
                  });
                } catch (e) {
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Hata: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  setState(() {
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Kaydet'),
          ),
        ],
      ),
    );
  }

  void _showDeleteColumnConfirmation(BoardColumn column) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sütunu Sil'),
        content: Text('\"${column.name}\" sütununu silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve sütundaki tüm görevler silinecektir.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () async {
              setState(() {
                _isLoading = true;
              });
              try {
                await ref.read(projectsProvider.notifier).deleteColumn(column.id);
                if (!mounted) return;
                Navigator.pop(context);
                setState(() {
                  _isLoading = false;
                  _initLists();
                });
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Hata: ${e.toString()}'),
                    backgroundColor: Colors.red,
                  ),
                );
                setState(() {
                  _isLoading = false;
                });
              }
            },
            child: const Text(
              'Sil',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _createColumn() {
    final nameController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Sütun'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Sütun Adı',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isNotEmpty) {
                setState(() {
                  _isLoading = true;
                });
                try {
                  await ref.read(projectsProvider.notifier).createColumn(
                    _board.id,
                    name,
                  );
                  if (!mounted) return;
                  Navigator.pop(context);
                  setState(() {
                    _isLoading = false;
                    _initLists();
                  });
                } catch (e) {
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Hata: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  setState(() {
                    _isLoading = false;
                  });
                }
              }
            },
            child: const Text('Oluştur'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_board.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Board düzenleme ekranına git
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _lists.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.view_column,
                        size: 80,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Bu panoda henüz sütun bulunmuyor',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Yeni bir sütun oluşturmak için sağ alttaki butona tıklayın',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _createColumn,
                        icon: const Icon(Icons.add),
                        label: const Text('Sütun Oluştur'),
                      ),
                    ],
                  ),
                )
              : DragAndDropLists(
                  children: _lists,
                  onItemReorder: (int oldItemIndex, int oldListIndex, int newItemIndex, int newListIndex) {
                    // Görev taşıma işlemi
                    setState(() {
                      final movedItem = _lists[oldListIndex].children.removeAt(oldItemIndex);
                      _lists[newListIndex].children.insert(newItemIndex, movedItem);
                    });
                  },
                  onListReorder: (int oldListIndex, int newListIndex) {
                    // Sütun taşıma işlemi
                    setState(() {
                      final movedList = _lists.removeAt(oldListIndex);
                      _lists.insert(newListIndex, movedList);
                    });
                  },
                  listPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  listDraggingWidth: 350,
                  listWidth: 300,
                  contentsWhenEmpty: const Center(
                    child: Text('Bu sütunda görev bulunmuyor'),
                  ),
                  listDecoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createColumn,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;

  const TaskCard({
    Key? key,
    required this.task,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.title,
                style: Theme.of(context).textTheme.titleMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (task.description != null && task.description!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  task.description!,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (task.dueDate != null)
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${task.dueDate!.day}/${task.dueDate!.month}/${task.dueDate!.year}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  if (task.assignee != null)
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      backgroundImage: task.assignee?.avatarUrl != null
                          ? NetworkImage(task.assignee!.avatarUrl!)
                          : null,
                      child: task.assignee?.avatarUrl == null
                          ? Text(
                              task.assignee!.name[0].toUpperCase(),
                              style: const TextStyle(
                                fontSize: 10,
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
    );
  }
}
