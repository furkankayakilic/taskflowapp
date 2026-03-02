import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../providers/auth_provider.dart';
import 'task_detail_screen.dart';
import 'create_task_screen.dart';

class TasksListScreen extends ConsumerStatefulWidget {
  final String boardId;

  const TasksListScreen({Key? key, required this.boardId}) : super(key: key);

  @override
  ConsumerState<TasksListScreen> createState() => _TasksListScreenState();
}

class _TasksListScreenState extends ConsumerState<TasksListScreen> {
  bool _isLoading = false;
  List<Task> _tasks = [];

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final tasks = await ref.read(tasksProvider.notifier).getTasksByBoard(widget.boardId);
      setState(() {
        _tasks = tasks;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Görevler yüklenirken hata oluştu: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
        title: const Text('Görevler'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTasks,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tasks.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.task_alt,
                        size: 64,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Henüz görev bulunmuyor',
                        style: TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CreateTaskScreen(columnId: widget.boardId),
                            ),
                          ).then((_) => _loadTasks());
                        },
                        icon: const Icon(Icons.add),
                        label: const Text('Görev Ekle'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadTasks,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: _tasks.length,
                    itemBuilder: (context, index) {
                      final task = _tasks[index];
                      return TaskListItem(
                        task: task,
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => TaskDetailScreen(task: task),
                            ),
                          ).then((_) => _loadTasks());
                        },
                      );
                    },
                  ),
                ),
      floatingActionButton: _tasks.isNotEmpty
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CreateTaskScreen(columnId: widget.boardId),
                  ),
                ).then((_) => _loadTasks());
              },
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
}

class TaskListItem extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;

  const TaskListItem({
    Key? key,
    required this.task,
    required this.onTap,
  }) : super(key: key);

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
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      task.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  if (task.priority != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getPriorityColor(task.priority),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _getPriorityText(task.priority),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              if (task.description != null && task.description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  task.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.grey[700],
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (task.dueDate != null)
                    Row(
                      children: [
                        const Icon(
                          Icons.calendar_today,
                          size: 14,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          DateFormat('dd/MM/yyyy').format(task.dueDate!),
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  if (task.assignee != null)
                    Row(
                      children: [
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
                        const SizedBox(width: 4),
                        Text(
                          task.assignee!.name,
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
              if (task.comments != null && task.comments!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(
                      Icons.comment,
                      size: 14,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${task.comments!.length} yorum',
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
