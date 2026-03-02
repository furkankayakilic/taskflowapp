import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HomeStackParamList, NavigationProp } from '../../navigation/types';
import { teamService, TeamMember } from '../../services/teams';

type TeamMembersRouteProp = RouteProp<HomeStackParamList, 'TeamMembers'>;

export const TeamMembersScreen = () => {
  const route = useRoute<TeamMembersRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const membersData = await teamService.getTeamMembers(route.params.teamId);
      setMembers(membersData);
    } catch (error) {
      Alert.alert('Hata', 'Takım üyeleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresini girin');
      return;
    }

    try {
      await teamService.addTeamMember(route.params.teamId, email);
      setEmail('');
      loadTeamMembers();
    } catch (error) {
      Alert.alert('Hata', 'Üye eklenirken bir hata oluştu');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await teamService.removeTeamMember(route.params.teamId, memberId);
      loadTeamMembers();
    } catch (error) {
      Alert.alert('Hata', 'Üye çıkarılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.addMemberContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta adresi"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMember}
        >
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberEmail}>{item.email}</Text>
              <Text style={styles.memberRole}>
                {item.role === 'admin' ? 'Yönetici' : 'Üye'}
              </Text>
            </View>
            {item.role !== 'admin' && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMember(item.id)}
              >
                <Text style={styles.removeButtonText}>Çıkar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.membersList}
      />
    </View>
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
  },
  addMemberContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  membersList: {
    padding: 16,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 