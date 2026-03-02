import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../models/task.dart';
import '../../models/comment.dart';
import '../../providers/task_provider.dart';
import '../../providers/auth_provider.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final Task task;

  const TaskDetailScreen({Key? key, required this.task}) : super(key: key);

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  late Task _task;
  final _commentController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _task = widget.task;
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  void _showEditTaskDialog() {
    final titleController = TextEditingController(text: _task.title);
    final descriptionController = TextEditingController(text: _task.description);
    DateTime? dueDate = _task.dueDate;
    String? priority = _getPriorityText(_task.priority);

    final List<String> priorities = ['Düşük', 'Orta', 'Yüksek', 'Acil'];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Görevi Düzenle'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Başlık',
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Açıklama',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () async {
                  final DateTime? picked = await showDatePicker(
                    context: context,
                    initialDate: dueDate ?? DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime(2100),
                  );
                  if (picked != null) {
                    setState(() {
                      dueDate = picked;
                    });
                  }
                },
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Bitiş Tarihi',
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    dueDate == null
                        ? 'Tarih seçin'
                        : DateFormat('dd/MM/yyyy').format(dueDate!),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Öncelik',
                ),
                value: priority,
                items: priorities.map((priority) {
                  return DropdownMenuItem(
                    value: priority,
                    child: Text(priority),
                  );
                }).toList(),
                onChanged: (value) {
                  priority = value;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('İptal'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() {
                _isLoading = true;
              });

              try {
                final updates = {
                  'title': titleController.text.trim(),
                  'description': descriptionController.text.trim(),
                  'due_date': dueDate?.toIso8601String(),
                  'priority': _getPriorityValue(priority),
                };

                final updatedTask = await ref.read(tasksProvider.notifier).updateTask(
                      _task.id,
                      updates,
                    );

                if (updatedTask != null) {
                  setState(() {
                    _task = updatedTask;
                    _isLoading = false;
                  });
                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Görev başarıyla güncellendi'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                setState(() {
                  _isLoading = false;
                });
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Hata: ${e.toString()}'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            child: const Text('Kaydet'),
          ),
        ],
      ),
    );
  }

  void _showDeleteTaskConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Görevi Sil'),
        content: const Text('Bu görevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
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
              Navigator.pop(context);
              setState(() {
                _isLoading = true;
              });

              try {
                final success = await ref.read(tasksProvider.notifier).deleteTask(_task.id);

                if (success) {
                  if (!mounted) return;
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Görev başarıyla silindi'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              } catch (e) {
                setState(() {
                  _isLoading = false;
                });
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Hata: ${e.toString()}'),
                    backgroundColor: Colors.red,
                  ),
                );
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

  void _addComment() async {
    final comment = _commentController.text.trim();
    if (comment.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final newComment = await ref.read(tasksProvider.notifier).addComment(
            _task.id,
            comment,
          );

      if (newComment != null) {
        _commentController.clear();
        setState(() {
          final updatedComments = [...(_task.comments ?? []), newComment];
          _task = Task(
            id: _task.id,
            title: _task.title,
            description: _task.description,
            columnId: _task.columnId,
            assigneeId: _task.assigneeId,
            assignee: _task.assignee,
            createdById: _task.createdById,
            createdBy: _task.createdBy,
            dueDate: _task.dueDate,
            priority: _task.priority,
            orderIndex: _task.orderIndex,
            comments: List<Comment>.from(updatedComments),
            attachments: _task.attachments,
            createdAt: _task.createdAt,
            updatedAt: _task.updatedAt,
          );
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Hata: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String? _getPriorityText(String? priority) {
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
        return null;
    }
  }

  String? _getPriorityValue(String? priority) {
    switch (priority) {
      case 'Düşük':
        return 'low';
      case 'Orta':
        return 'medium';
      case 'Yüksek':
        return 'high';
      case 'Acil':
        return 'urgent';
      default:
        return null;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Görev Detayı'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: _showEditTaskDialog,
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _showDeleteTaskConfirmation,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Görev başlığı
                        Text(
                          _task.title,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 8),
                        
                        // Görev meta bilgileri
                        Wrap(
                          spacing: 8,
                          children: [
                            if (_task.priority != null)
                              Chip(
                                label: Text(_getPriorityText(_task.priority) ?? ''),
                                backgroundColor: _getPriorityColor(_task.priority),
                                labelStyle: const TextStyle(color: Colors.white),
                              ),
                            if (_task.dueDate != null)
                              Chip(
                                avatar: const Icon(Icons.calendar_today, size: 16, color: Colors.white),
                                label: Text(DateFormat('dd/MM/yyyy').format(_task.dueDate!)),
                                backgroundColor: Colors.blueGrey,
                                labelStyle: const TextStyle(color: Colors.white),
                              ),
                            if (_task.assignee != null)
                              Chip(
                                avatar: CircleAvatar(
                                  backgroundColor: Theme.of(context).colorScheme.primary,
                                  backgroundImage: _task.assignee?.avatarUrl != null
                                      ? NetworkImage(_task.assignee!.avatarUrl!)
                                      : null,
                                  child: _task.assignee?.avatarUrl == null
                                      ? Text(
                                          _task.assignee!.name[0].toUpperCase(),
                                          style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        )
                                      : null,
                                ),
                                label: Text(_task.assignee!.name),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Görev açıklaması
                        if (_task.description != null && _task.description!.isNotEmpty) ...[
                          Text(
                            'Açıklama',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _task.description!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const SizedBox(height: 24),
                        ],
                        
                        // Yorumlar
                        Text(
                          'Yorumlar',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        
                        if (_task.comments == null || _task.comments!.isEmpty)
                          const Text('Henüz yorum yok')
                        else
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _task.comments!.length,
                            itemBuilder: (context, index) {
                              final comment = _task.comments![index];
                              return CommentItem(comment: comment);
                            },
                          ),
                      ],
                    ),
                  ),
                ),
                
                // Yorum ekleme alanı
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentController,
                          decoration: const InputDecoration(
                            hintText: 'Yorum ekleyin...',
                            border: OutlineInputBorder(),
                          ),
                          maxLines: null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: _addComment,
                        icon: const Icon(Icons.send),
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class CommentItem extends StatelessWidget {
  final Comment comment;

  const CommentItem({Key? key, required this.comment}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  backgroundImage: comment.user?.avatarUrl != null
                      ? NetworkImage(comment.user!.avatarUrl!)
                      : null,
                  child: comment.user?.avatarUrl == null
                      ? Text(
                          comment.user?.name.isNotEmpty == true
                              ? comment.user!.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        comment.user?.name ?? 'Bilinmeyen Kullanıcı',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        DateFormat('dd/MM/yyyy HH:mm').format(comment.createdAt),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(comment.content),
          ],
        ),
      ),
    );
  }
}
