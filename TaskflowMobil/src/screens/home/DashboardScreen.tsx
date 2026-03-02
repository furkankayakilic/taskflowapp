import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, SafeAreaView, Platform, StatusBar, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import { projectsService, Project } from '../../services/projects';
import { tasksService, Task } from '../../services/tasks';
import { teamsService, Team } from '../../services/teams';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projects, tasks, teamsData] = await Promise.all([
        projectsService.getProjects(),
        tasksService.getTasks(),
        teamsService.getTeams(),
      ]);

      // Tüm projeleri göster
      setActiveProjects(projects);

      // Yaklaşan görevleri filtrele (sonraki 7 gün)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcoming = tasks.filter(t => {
        const dueDate = new Date(t.due_date);
        return dueDate <= nextWeek;
      });
      setUpcomingTasks(upcoming);

      setTeams(teamsData);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return '#6b7280';
      case 'in_progress':
        return '#2563eb';
      case 'review':
        return '#d97706';
      case 'done':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Yapılacak';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'review':
        return 'İncelemede';
      case 'done':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1e40af', '#2563eb']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadDashboardData}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                <Ionicons name="folder-open" size={24} color="#2563eb" />
              </View>
              <Text style={styles.statNumber}>{activeProjects.length}</Text>
              <Text style={styles.statLabel}>Aktif Proje</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              </View>
              <Text style={styles.statNumber}>{upcomingTasks.length}</Text>
              <Text style={styles.statLabel}>Yaklaşan Görev</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(217, 119, 6, 0.2)' }]}>
                <Ionicons name="people" size={24} color="#d97706" />
              </View>
              <Text style={styles.statNumber}>{teams.length}</Text>
              <Text style={styles.statLabel}>Takım</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Aktif Projeler</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Projects')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
            {activeProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Aktif proje bulunmuyor</Text>
              </View>
            ) : (
              activeProjects.slice(0, 3).map(project => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
                >
                  <LinearGradient
                    colors={['#f3f4f6', '#fff']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardIconContainer, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                        <Ionicons name="folder" size={20} color="#2563eb" />
                      </View>
                      <Text style={styles.cardTitle}>{project.name}</Text>
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {project.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yaklaşan Görevler</Text>
            </View>
            {upcomingTasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Yaklaşan görev bulunmuyor</Text>
              </View>
            ) : (
              upcomingTasks.slice(0, 3).map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                >
                  <LinearGradient
                    colors={['#f3f4f6', '#fff']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardIconContainer, { backgroundColor: 'rgba(5, 150, 105, 0.1)' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#059669" />
                      </View>
                      <Text style={styles.cardTitle}>{task.title}</Text>
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                    <View style={styles.taskMeta}>
                      <View style={styles.dueDateContainer}>
                        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                        <Text style={styles.taskDueDate}>
                          {new Date(task.due_date).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Takımlarınız</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Teams')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
            {teams.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>Takım bulunmuyor</Text>
              </View>
            ) : (
              teams.slice(0, 3).map(team => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('TeamDetails', { teamId: team.id })}
                >
                  <LinearGradient
                    colors={['#f3f4f6', '#fff']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.cardIconContainer, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                        <Ionicons name="people" size={20} color="#d97706" />
                      </View>
                      <Text style={styles.cardTitle}>{team.name}</Text>
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {team.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    marginRight: 4,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
}); 