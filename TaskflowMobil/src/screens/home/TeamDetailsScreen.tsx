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
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HomeStackParamList, NavigationProp } from '../../navigation/types';
import { teamsService, Team, TeamMember } from '../../services/teams';
import { projectsService, Project } from '../../services/projects';
import { CreateProjectModal } from '../../components/CreateProjectModal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type TeamDetailsRouteProp = RouteProp<HomeStackParamList, 'TeamDetails'>;

export const TeamDetailsScreen = () => {
  const route = useRoute<TeamDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { teamId } = route.params;
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadTeamDetails();
  }, [teamId]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const [teamData, membersData, projectsData] = await Promise.all([
        teamsService.getTeam(teamId),
        teamsService.getTeamMembers(teamId),
        projectsService.getTeamProjects(teamId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Team details loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectPress = (projectId: number) => {
    navigation.navigate('ProjectDetails', { projectId });
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Hata', 'Lütfen bir e-posta adresi girin');
      return;
    }

    try {
      setInviting(true);
      await teamsService.inviteTeamMember(teamId, inviteEmail.trim());
      Alert.alert('Başarılı', 'Kullanıcı takıma davet edildi');
      setInviteEmail('');
      loadTeamDetails(); // Refresh member list
    } catch (error) {
      console.error('Invite error:', error);
      Alert.alert('Hata', 'Kullanıcı davet edilirken bir hata oluştu');
    } finally {
      setInviting(false);
    }
  };

  if (loading || !team) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Takım Bilgileri</Text>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamDescription}>{team.description}</Text>
        <Text style={styles.teamDate}>
          Oluşturulma: {new Date(team.created_at).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Takım Üyeleri</Text>
        <View style={styles.inviteContainer}>
          <TextInput
            style={styles.inviteInput}
            value={inviteEmail}
            onChangeText={setInviteEmail}
            placeholder="E-posta adresi ile davet et"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.inviteButton, inviting && styles.inviteButtonDisabled]}
            onPress={handleInviteMember}
            disabled={inviting}
          >
            {inviting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#fff" style={styles.inviteButtonIcon} />
                <Text style={styles.inviteButtonText}>Davet Et</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {members.length === 0 ? (
          <Text style={styles.emptyText}>Henüz üye bulunmuyor</Text>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {member.user?.name || 'İsimsiz Üye'}
                </Text>
                <Text style={styles.memberEmail}>
                  {member.user?.email || 'E-posta yok'}
                </Text>
              </View>
              <Text
                style={[
                  styles.memberRole,
                  { color: member.role === 'admin' ? '#2563eb' : '#6b7280' },
                ]}
              >
                {member.role === 'admin' ? 'Yönetici' : 'Üye'}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projeler</Text>
        {projects.length === 0 ? (
          <Text style={styles.emptyText}>Henüz proje bulunmuyor</Text>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => handleProjectPress(project.id)}
            >
              <Text style={styles.projectTitle}>{project.name}</Text>
              <Text style={styles.projectDescription} numberOfLines={2}>
                {project.description}
              </Text>
              <View style={styles.projectMeta}>
                <Text
                  style={[
                    styles.projectStatus,
                    {
                      color:
                        project.status === 'active'
                          ? '#059669'
                          : project.status === 'completed'
                          ? '#2563eb'
                          : '#6b7280',
                    },
                  ]}
                >
                  {project.status === 'active'
                    ? 'Aktif'
                    : project.status === 'completed'
                    ? 'Tamamlandı'
                    : 'Arşivlendi'}
                </Text>
                <Text style={styles.projectDate}>
                  {new Date(project.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsCreateModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateProjectModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onProjectCreated={loadTeamDetails}
        teams={[team]}
      />
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
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  teamDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  inviteContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  inviteInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inviteButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  inviteButtonIcon: {
    marginRight: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  projectCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  projectDate: {
    fontSize: 12,
    color: '#6b7280',
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