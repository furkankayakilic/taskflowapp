import React, { useState, useEffect } from 'react';
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
import { tasksService } from '../services/tasks';
import { projectsService } from '../services/projects';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  projectId: number;
}

export const CreateTaskModal = ({
  visible,
  onClose,
  onTaskCreated,
  projectId,
}: CreateTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [columnId, setColumnId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      loadProjectBoard();
    }
  }, [visible, projectId]);

  const loadProjectBoard = async () => {
    try {
      const project = await projectsService.getProject(projectId);
      
      // Check if project has a board and columns
      if (!project.boards || !project.boards[0] || !project.boards[0].columns || !project.boards[0].columns.length) {
        // Create default board and columns
        const { board, columns } = await projectsService.createDefaultBoardAndColumns(projectId);
        setColumnId(columns[0].id); // Set first column (Yapılacak) as default
      } else {
        setColumnId(project.boards[0].columns[0].id);
      }
    } catch (error) {
      console.error('Error loading project board:', error);
      Alert.alert('Hata', 'Proje bilgileri yüklenirken bir hata oluştu');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı boş olamaz');
      return;
    }

    if (!columnId) {
      Alert.alert('Hata', 'Görev eklenecek kolon bulunamadı');
      return;
    }

    try {
      setLoading(true);
      await tasksService.createTask({
        title: title.trim(),
        description: description.trim(),
        project_id: projectId,
        column_id: columnId,
        priority,
        due_date: dueDate,
      });
      Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => {
      onTaskCreated();
      onClose();
      // Form alanlarını temizle
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
        }}
      ]);
    } catch (error) {
      console.error('Task creation error:', error);
      Alert.alert('Hata', 'Görev oluşturulurken bir hata oluştu');
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
          <Text style={styles.modalTitle}>Yeni Görev</Text>

          <ScrollView style={styles.scrollView}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Başlık</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Görev başlığını girin"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Görev açıklamasını girin"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Öncelik</Text>
              <View style={styles.priorityButtons}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'low' && styles.selectedPriorityButton,
                  ]}
                  onPress={() => setPriority('low')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'low' && styles.selectedPriorityButtonText,
                    ]}
                  >
                    Düşük
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'medium' && styles.selectedPriorityButton,
                  ]}
                  onPress={() => setPriority('medium')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'medium' && styles.selectedPriorityButtonText,
                    ]}
                  >
                    Orta
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 'high' && styles.selectedPriorityButton,
                  ]}
                  onPress={() => setPriority('high')}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 'high' && styles.selectedPriorityButtonText,
                    ]}
                  >
                    Yüksek
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bitiş Tarihi</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
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
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  selectedPriorityButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  selectedPriorityButtonText: {
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