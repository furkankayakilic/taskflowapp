import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import { projectsService, Project } from '../../services/projects';
import { teamsService, Team } from '../../services/teams';
import { Ionicons } from '@expo/vector-icons';
import { CreateProjectModal } from '../../components/CreateProjectModal';
import { EditProjectModal } from '../../components/EditProjectModal';
import { LinearGradient } from 'expo-linear-gradient';

export const ProjectsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, teamsData] = await Promise.all([
        projectsService.getProjects(),
        teamsService.getTeams(),
      ]);
      setProjects(projectsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    Alert.alert(
      'Projeyi Sil',
      'Bu projeyi silmek istediğinizden emin misiniz?',
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
              await projectsService.deleteProject(projectId);
              await loadData();
            } catch (error) {
              console.error('Project deletion error:', error);
              Alert.alert('Hata', 'Proje silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalVisible(true);
  };

  const handleCreateProject = () => {
    if (teams.length === 0) {
      Alert.alert(
        'Hata',
        'Önce bir takım oluşturmalısınız.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Teams'),
          },
        ]
      );
      return;
    }
    setIsCreateModalVisible(true);
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
      <LinearGradient
        colors={['#1e40af', '#2563eb']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Projeler</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadData}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id })}
            >
              <LinearGradient
                colors={['#f3f4f6', '#fff']}
                style={styles.cardGradient}
              >
                <View style={styles.projectHeader}>
                  <View style={[styles.projectIconContainer, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                    <Ionicons name="folder" size={20} color="#2563eb" />
                  </View>
                  <Text style={styles.projectTitle}>{item.name}</Text>
                </View>
                <Text style={styles.projectDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.projectMeta}>
                  <View style={styles.projectInfo}>
                    <View style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: item.status === 'active' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      }
                    ]}>
                      <Ionicons 
                        name={item.status === 'active' ? 'play-circle' : 'checkmark-circle'} 
                        size={14} 
                        color={item.status === 'active' ? '#2563eb' : '#6b7280'} 
                        style={styles.statusIcon}
                      />
                      <Text style={[
                        styles.statusText,
                        { color: item.status === 'active' ? '#2563eb' : '#6b7280' }
                      ]}>
                        {item.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                      </Text>
                    </View>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.projectActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}
                      onPress={() => handleEditProject(item)}
                    >
                      <Ionicons name="pencil" size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: 'rgba(220, 38, 38, 0.1)' }]}
                      onPress={() => handleDeleteProject(item.id)}
                    >
                      <Ionicons name="trash" size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz proje bulunmuyor</Text>
              <Text style={styles.emptySubText}>Yeni bir proje oluşturmak için + butonuna tıklayın</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateProject}
        >
          <LinearGradient
            colors={['#2563eb', '#1e40af']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <CreateProjectModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onProjectCreated={loadData}
          teams={teams}
        />

        {selectedProject && (
          <EditProjectModal
            visible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false);
              setSelectedProject(null);
            }}
            onProjectUpdated={loadData}
            project={selectedProject}
          />
        )}
      </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 48,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 