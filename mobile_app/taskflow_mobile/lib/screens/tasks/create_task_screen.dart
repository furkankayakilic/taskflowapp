import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../providers/task_provider.dart';
import '../../providers/auth_provider.dart';

class CreateTaskScreen extends ConsumerStatefulWidget {
  final String columnId;

  const CreateTaskScreen({Key? key, required this.columnId}) : super(key: key);

  @override
  ConsumerState<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends ConsumerState<CreateTaskScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime? _dueDate;
  String? _priority;
  bool _isLoading = false;

  final List<String> _priorities = ['Düşük', 'Orta', 'Yüksek', 'Acil'];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _dueDate) {
      setState(() {
        _dueDate = picked;
      });
    }
  }

  void _createTask() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final currentUser = ref.read(authStateProvider).user;
        
        final taskData = {
          'title': _titleController.text.trim(),
          'description': _descriptionController.text.trim(),
          'column_id': widget.columnId,
          'assignee_id': currentUser?.id, // Varsayılan olarak kendimize atayalım
          'due_date': _dueDate?.toIso8601String(),
          'priority': _getPriorityValue(),
        };

        final newTask = await ref.read(tasksProvider.notifier).createTask(taskData);

        if (!mounted) return;
        
        if (newTask != null) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Görev başarıyla oluşturuldu'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Görev oluşturulurken bir hata oluştu'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Hata: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  String? _getPriorityValue() {
    switch (_priority) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Yeni Görev'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Başlık',
                  hintText: 'Görev başlığını girin',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Lütfen bir başlık girin';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Açıklama',
                  hintText: 'Görev açıklamasını girin',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              InkWell(
                onTap: () => _selectDate(context),
                child: InputDecorator(
                  decoration: const InputDecoration(
                    labelText: 'Bitiş Tarihi',
                    suffixIcon: Icon(Icons.calendar_today),
                  ),
                  child: Text(
                    _dueDate == null
                        ? 'Tarih seçin'
                        : DateFormat('dd/MM/yyyy').format(_dueDate!),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Öncelik',
                ),
                value: _priority,
                items: _priorities.map((priority) {
                  return DropdownMenuItem(
                    value: priority,
                    child: Text(priority),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _priority = value;
                  });
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _createTask,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Görev Oluştur'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
