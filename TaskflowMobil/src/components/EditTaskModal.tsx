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
import { tasksService, Task } from '../services/tasks';

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  task: Task;
  projectId: number;
}

export const EditTaskModal = ({
  visible,
  onClose,
  onTaskUpdated,
  task,
  projectId,
}: EditTaskModalProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı boş olamaz');
      return;
    }

    try {
      setLoading(true);
      await tasksService.updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate,
        column_id: task.column_id
      });
      onTaskUpdated();
      onClose();
    } catch (error) {
      console.error('Task update error:', error);
      Alert.alert('Hata', 'Görev güncellenirken bir hata oluştu');
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
          <Text style={styles.modalTitle}>Görevi Düzenle</Text>

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
                <Text style={styles.submitButtonText}>Güncelle</Text>
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