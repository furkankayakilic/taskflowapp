import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { projectsService } from '../services/projects';
import { Team } from '../services/teams';

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  teams: Team[];
}

export const CreateProjectModal = ({
  visible,
  onClose,
  onProjectCreated,
  teams,
}: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Proje adı boş olamaz');
      return;
    }

    if (!selectedTeamId) {
      Alert.alert('Hata', 'Lütfen bir takım seçin');
      return;
    }

    try {
      setLoading(true);
      await projectsService.createProject({
        name: name.trim(),
        description: description.trim(),
        team_id: selectedTeamId,
      });
      setName('');
      setDescription('');
      setSelectedTeamId(null);
      onProjectCreated();
      onClose();
    } catch (error) {
      console.error('Project creation error:', error);
      Alert.alert('Hata', 'Proje oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yeni Proje</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Proje Adı</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Proje adını girin"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Proje açıklamasını girin"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Takım</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.teamsScrollView}
              >
                {teams.map((team) => (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamButton,
                      selectedTeamId === team.id && styles.selectedTeamButton,
                    ]}
                    onPress={() => setSelectedTeamId(team.id)}
                  >
                    <Text
                      style={[
                        styles.teamButtonText,
                        selectedTeamId === team.id && styles.selectedTeamButtonText,
                      ]}
                    >
                      {team.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Oluştur</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  scrollView: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
  },
  teamsScrollView: {
    flexDirection: 'row',
    marginTop: 8,
  },
  teamButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedTeamButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  selectedTeamButtonText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
}); 