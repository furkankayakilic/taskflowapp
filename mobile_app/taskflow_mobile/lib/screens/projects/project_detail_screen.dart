import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/project.dart';
import '../../models/board.dart';
import '../../providers/project_provider.dart';
import '../tasks/board_screen.dart';
import 'boards/board_list_screen.dart';

class ProjectDetailScreen extends ConsumerStatefulWidget {
  final Project project;

  const ProjectDetailScreen({Key? key, required this.project}) : super(key: key);

  @override
  ConsumerState<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends ConsumerState<ProjectDetailScreen> {
  late Project _project;

  @override
  void initState() {
    super.initState();
    _project = widget.project;
    ref.read(selectedProjectProvider.notifier).state = _project;
  }

  void _createBoard() {
    showDialog(
      context: context,
      builder: (context) => CreateBoardDialog(projectId: _project.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_project.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // Proje düzenleme ekranına git
            },
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Proje bilgileri
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_project.description != null && _project.description!.isNotEmpty) ...[
                  Text(
                    'Açıklama',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _project.description!,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                ],
                Row(
                  children: [
                    const Icon(Icons.people, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${_project.members?.length ?? 0} Üye',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(width: 16),
                    if (_project.team != null) ...[
                      const Icon(Icons.group, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Takım: ${_project.team!.name}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          
          // Panolar başlığı
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Panolar',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton.icon(
                  onPressed: _createBoard,
                  icon: const Icon(Icons.add),
                  label: const Text('Yeni Pano'),
                ),
              ],
            ),
          ),
          
          // Panolar listesi
          Expanded(
            child: _project.boards == null || _project.boards!.isEmpty
                ? const Center(
                    child: Text('Bu projede henüz pano bulunmuyor'),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _project.boards!.length,
                    itemBuilder: (context, index) {
                      final board = _project.boards![index];
                      return BoardCard(
                        board: board,
                        onTap: () {
                          ref.read(selectedBoardProvider.notifier).state = board;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BoardListScreen(
                                projectId: _project.id,
                                projectName: _project.name,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createBoard,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class BoardCard extends StatelessWidget {
  final Board board;
  final VoidCallback onTap;

  const BoardCard({
    Key? key,
    required this.board,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.dashboard),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      board.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${board.columns?.length ?? 0} Sütun',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class CreateBoardDialog extends ConsumerStatefulWidget {
  final String projectId;

  const CreateBoardDialog({Key? key, required this.projectId}) : super(key: key);

  @override
  ConsumerState<CreateBoardDialog> createState() => _CreateBoardDialogState();
}

class _CreateBoardDialogState extends ConsumerState<CreateBoardDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _createBoard() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        final newBoard = await ref.read(projectsProvider.notifier).createBoard(
              widget.projectId,
              _nameController.text.trim(),
            );

        if (!mounted) return;
        
        if (newBoard != null) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pano başarıyla oluşturuldu'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Pano oluşturulurken bir hata oluştu'),
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

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Yeni Pano'),
      content: Form(
        key: _formKey,
        child: TextFormField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Pano Adı',
            hintText: 'Panonuzun adını girin',
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Lütfen bir pano adı girin';
            }
            return null;
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('İptal'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _createBoard,
          child: _isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text('Oluştur'),
        ),
      ],
    );
  }
}
