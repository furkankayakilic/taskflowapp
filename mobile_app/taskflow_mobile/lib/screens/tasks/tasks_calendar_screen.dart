import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:taskflow_mobile/providers/task_provider.dart';

class TasksCalendarScreen extends ConsumerWidget {
  const TasksCalendarScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(tasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Takvim'),
      ),
      body: Column(
        children: [
          TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: DateTime.now(),
            calendarFormat: CalendarFormat.month,
            eventLoader: (day) {
              return tasks.where((task) => task.dueDate.day == day.day).toList();
            },
            onDaySelected: (selectedDay, focusedDay) {
              // Görev detaylarını göstermek için gerekli işlemler
              final selectedTasks = tasks.where((task) => task.dueDate.day == selectedDay.day).toList();
              if (selectedTasks.isNotEmpty) {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text('Görevler: ${selectedDay.day}/${selectedDay.month}/${selectedDay.year}'),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: selectedTasks.map((task) => ListTile(
                        title: Text(task.title),
                        subtitle: Text(task.description),
                        trailing: Text(task.dueDate.toString()),
                      )).toList(),
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Kapat'),
                      ),
                    ],
                  ),
                );
              }
            },
          ),
          Expanded(
            child: ListView.builder(
              itemCount: tasks.length,
              itemBuilder: (context, index) {
                final task = tasks[index];
                return ListTile(
                  title: Text(task.title),
                  subtitle: Text(task.description),
                  trailing: Text(task.dueDate.toString()),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
