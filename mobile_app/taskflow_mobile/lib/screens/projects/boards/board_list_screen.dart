import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../models/board.dart';
import '../../../providers/project_provider.dart';
import '../../boards/kanban_board_screen.dart';

class BoardListScreen extends ConsumerStatefulWidget {
  final String projectId;
  final String projectName;

  const BoardListScreen({
    Key? key,
    required this.projectId,
    required this.projectName,
  }) : super(key: key);

  @override
  ConsumerState<BoardListScreen> createState() => _BoardListScreenState();
}

class _BoardListScreenState extends ConsumerState<BoardListScreen> {
  bool _isLoading = false;
  List<Board> _boards = [];

  @override
  void initState() {
    super.initState();
    _loadBoards();
  }

  Future<void> _loadBoards() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final project = await ref.read(projectsProvider.notifier).getProjectDetail(widget.projectId);
      
      if (project != null && project.boards != null) {
        setState(() {
          _boards = project.boards!;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Panolar yüklenirken hata oluştu: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _createBoard() {
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeni Pano Oluştur'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Pano Adı',
            hintText: 'Örn: Sprint 1, Geliştirme, Pazarlama',
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
                final newBoard = await ref.read(projectsProvider.notifier).createBoard(
                  widget.projectId,
                  name,
                );

                if (newBoard != null) {
                  await _loadBoards();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Pano oluşturulurken hata oluştu: ${e.toString()}'),
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

  void _openBoard(Board board) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => KanbanBoardScreen(
          boardId: board.id,
          boardName: board.name,
        ),
      ),
    ).then((_) => _loadBoards());
  }

  void _editBoard(Board board) {
    final nameController = TextEditingController(text: board.name);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pano Düzenle'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Pano Adı',
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
                final updatedBoard = await ref.read(projectsProvider.notifier).updateBoard(
                  board.id,
                  name,
                );

                if (updatedBoard != null) {
                  await _loadBoards();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Pano güncellenirken hata oluştu: ${e.toString()}'),
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

  void _deleteBoard(Board board) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Panoyu Sil'),
        content: Text('${board.name} panosunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
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
                final success = await ref.read(projectsProvider.notifier).deleteBoard(board.id);

                if (success) {
                  await _loadBoards();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Pano silinirken hata oluştu: ${e.toString()}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                  setState(() {
                    _isLoading = false;
                  });
                }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.projectName} Panoları'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBoards,
            tooltip: 'Yenile',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _boards.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.dashboard,
                        size: 64,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Bu projede henüz pano bulunmuyor',
                        style: TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _createBoard,
                        icon: const Icon(Icons.add),
                        label: const Text('Pano Oluştur'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _boards.length,
                  itemBuilder: (context, index) {
                    final board = _boards[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: InkWell(
                        onTap: () => _openBoard(board),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.dashboard,
                                color: Colors.blueGrey,
                                size: 32,
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      board.name,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (board.columns != null) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        '${board.columns!.length} sütun',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 14,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              PopupMenuButton(
                                icon: const Icon(Icons.more_vert),
                                itemBuilder: (context) => [
                                  const PopupMenuItem(
                                    value: 'edit',
                                    child: Row(
                                      children: [
                                        Icon(Icons.edit, size: 18),
                                        SizedBox(width: 8),
                                        Text('Düzenle'),
                                      ],
                                    ),
                                  ),
                                  const PopupMenuItem(
                                    value: 'delete',
                                    child: Row(
                                      children: [
                                        Icon(Icons.delete, size: 18, color: Colors.red),
                                        SizedBox(width: 8),
                                        Text('Sil', style: TextStyle(color: Colors.red)),
                                      ],
                                    ),
                                  ),
                                ],
                                onSelected: (value) {
                                  if (value == 'edit') {
                                    _editBoard(board);
                                  } else if (value == 'delete') {
                                    _deleteBoard(board);
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: _boards.isNotEmpty
          ? FloatingActionButton(
              onPressed: _createBoard,
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
}
