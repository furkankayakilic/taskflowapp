import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/project.dart';
import '../../providers/project_provider.dart';
import 'project_detail_screen.dart';
import 'create_project_screen.dart';

class ProjectsScreen extends ConsumerWidget {
  const ProjectsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsState = ref.watch(projectsProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(projectsProvider.notifier).fetchProjects();
        },
        child: projectsState.isLoading
            ? const Center(child: CircularProgressIndicator())
            : projectsState.error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Bir hata oluştu',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          projectsState.error!,
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            ref.read(projectsProvider.notifier).fetchProjects();
                          },
                          child: const Text('Tekrar Dene'),
                        ),
                      ],
                    ),
                  )
                : projectsState.projects.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.folder_open,
                              size: 80,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Henüz hiç projeniz yok',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Yeni bir proje oluşturmak için sağ alttaki butona tıklayın',
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: projectsState.projects.length,
                        itemBuilder: (context, index) {
                          final project = projectsState.projects[index];
                          return ProjectCard(project: project);
                        },
                      ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const CreateProjectScreen(),
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}

class ProjectCard extends StatelessWidget {
  final Project project;

  const ProjectCard({Key? key, required this.project}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProjectDetailScreen(project: project),
            ),
          );
        },
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    child: Text(
                      project.name.isNotEmpty ? project.name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          project.name,
                          style: Theme.of(context).textTheme.titleLarge,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (project.team != null)
                          Text(
                            'Takım: ${project.team!.name}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right),
                ],
              ),
              if (project.description != null && project.description!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  project.description!,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.dashboard, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${project.boards?.length ?? 0} Pano',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.people, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${project.members?.length ?? 0} Üye',
                    style: Theme.of(context).textTheme.bodySmall,
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
