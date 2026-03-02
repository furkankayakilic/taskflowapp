import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../../navigation/types';
import { teamsService, Team } from '../../services/teams';
import { CreateTeamModal } from '../../components/CreateTeamModal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const TeamsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsService.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Teams loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamPress = (teamId: number) => {
    navigation.navigate('TeamDetails', { teamId });
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
          <Text style={styles.title}>Takımlar</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadTeams}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.teamCard}
              onPress={() => handleTeamPress(item.id)}
            >
              <LinearGradient
                colors={['#f3f4f6', '#fff']}
                style={styles.cardGradient}
              >
                <View style={styles.teamHeader}>
                  <View style={[styles.teamIconContainer, { backgroundColor: 'rgba(217, 119, 6, 0.1)' }]}>
                    <Ionicons name="people" size={20} color="#d97706" />
                  </View>
                  <Text style={styles.teamTitle}>{item.name}</Text>
                </View>
                <Text style={styles.teamDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.teamMeta}>
                  <View style={styles.memberCount}>
                    <View style={styles.memberCountContainer}>
                      <Ionicons name="person" size={14} color="#6b7280" />
                      <Text style={styles.memberCountText}>
                        {item.member_count} Üye
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.membersButton}
                    onPress={() => navigation.navigate('TeamMembers', { teamId: item.id })}
                  >
                    <Text style={styles.membersButtonText}>Üyeleri Gör</Text>
                    <Ionicons name="chevron-forward" size={14} color="#2563eb" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz takım bulunmuyor</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <LinearGradient
            colors={['#2563eb', '#1e40af']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <CreateTeamModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onTeamCreated={loadTeams}
        />
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
    backgroundColor: '#fff',
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
  teamCard: {
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
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  teamDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  teamMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberCountText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  membersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
  },
  membersButtonText: {
    fontSize: 12,
    color: '#2563eb',
    marginRight: 4,
    fontWeight: '500',
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