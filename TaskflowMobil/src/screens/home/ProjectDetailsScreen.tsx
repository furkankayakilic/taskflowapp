import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HomeStackParamList, NavigationProp } from '../../navigation/types';
import { projectsService, Project } from '../../services/projects';
import { tasksService, Task } from '../../services/tasks';
import { CreateTaskModal } from '../../components/CreateTaskModal';
import { EditTaskModal } from '../../components/EditTaskModal';
import { Ionicons } from '@expo/vector-icons';

type ProjectDetailsRouteProp = RouteProp<HomeStackParamList, 'ProjectDetails'>;

export const ProjectDetailsScreen = () => {
  const route = useRoute<ProjectDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { projectId } = route.params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const projectData = await projectsService.getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Project details loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (taskId: number) => {
    if (!project) return;
    navigation.navigate('TaskDetails', { taskId, projectId: project.id });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await tasksService.deleteTask(projectId, taskId);
              await loadProjectDetails();
            } catch (error) {
              console.error('Task deletion error:', error);
              Alert.alert('Hata', 'Görev silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return '#059669';
      case 'medium':
        return '#d97706';
      case 'high':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'Düşük';
      case 'medium':
        return 'Orta';
      case 'high':
        return 'Yüksek';
      default:
        return priority;
    }
  };

  if (loading || !project) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Tüm görevleri düz bir diziye dönüştür
  const allTasks = project.boards?.flatMap(board =>
    board.columns?.flatMap(column =>
      column.tasks?.map(task => ({
        ...task,
        boardName: board.name,
        columnName: column.name,
        column_id: column.id,
        created_by: task.created_by,
        order_index: task.order_index,
        created_at: task.created_at,
        updated_at: task.updated_at
      })) || []
    ) || []
  ) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.description}>{project.description}</Text>
        {project.team_name && (
          <Text style={styles.teamName}>Takım: {project.team_name}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görevler</Text>
        {allTasks.length === 0 ? (
          <Text style={styles.emptyText}>Henüz görev bulunmuyor</Text>
        ) : (
          allTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleTaskPress(task.id)}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text
                    style={[
                      styles.taskPriority,
                      { color: getPriorityColor(task.priority) },
                    ]}
                  >
                    {getPriorityText(task.priority)}
                  </Text>
                </View>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description}
                </Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskLocation}>
                    {task.boardName} / {task.columnName}
                  </Text>
                  <Text style={styles.taskDueDate}>
                    {new Date(task.due_date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.taskActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditTask(task)}
                >
                  <Ionicons name="pencil" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteTask(task.id)}
                >
                  <Ionicons name="trash" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateTaskModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onTaskCreated={loadProjectDetails}
        projectId={project.id}
      />

      {selectedTask && (
        <EditTaskModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedTask(null);
          }}
          onTaskUpdated={loadProjectDetails}
          task={selectedTask}
          projectId={project.id}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flexDirection: 'row',
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskActions: {
    padding: 8,
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
}); 