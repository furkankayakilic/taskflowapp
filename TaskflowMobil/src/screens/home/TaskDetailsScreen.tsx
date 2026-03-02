import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HomeStackParamList, NavigationProp } from '../../navigation/types';
import { tasksService, Task, Comment, Attachment } from '../../services/tasks';
import { projectsService, Project } from '../../services/projects';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

type TaskDetailsRouteProp = RouteProp<HomeStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen = () => {
  const route = useRoute<TaskDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { taskId, projectId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId, projectId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      console.log('Loading task details for:', { taskId, projectId });
      const [taskData, projectData] = await Promise.all([
        tasksService.getTask(projectId, taskId),
        projectsService.getProject(projectId)
      ]);
      console.log('Task data received:', taskData);
      console.log('Project data received:', projectData);
      setTask(taskData);
      setProject(projectData);
    } catch (error: any) {
      console.error('Task details loading error:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      Alert.alert('Hata', 'Görev detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const newComment = await tasksService.addComment(taskId, comment);
      setTask(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment]
      } : null);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await tasksService.deleteComment(commentId);
      setTask(prev => prev ? {
        ...prev,
        comments: prev.comments?.filter(c => c.id !== commentId) || []
      } : null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Hata', 'Yorum silinirken bir hata oluştu.');
    }
  };

  const handleUploadFile = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const file = {
        uri: result.assets[0].uri,
        type: result.assets[0].mimeType,
        name: result.assets[0].name,
        size: result.assets[0].size
      };

      const newAttachment = await tasksService.uploadFile(taskId, file);
      setTask(prev => prev ? {
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      } : null);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Hata', 'Dosya yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (attachmentId: number) => {
    try {
      await tasksService.deleteFile(attachmentId);
      setTask(prev => prev ? {
        ...prev,
        attachments: prev.attachments?.filter(f => f.id !== attachmentId) || []
      } : null);
    } catch (error) {
      console.error('Error deleting file:', error);
      Alert.alert('Hata', 'Dosya silinirken bir hata oluştu.');
    }
  };

  const handleFilePress = async (attachment: Attachment) => {
    try {
      setUploading(true);
      
      // URL kontrolü
      if (!attachment.url) {
        throw new Error('Dosya URL\'i bulunamadı');
      }

      // Eğer dosya zaten cihazda ise (file:// ile başlıyorsa)
      if (attachment.url.startsWith('file://')) {
        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(attachment.url);
          await Linking.openURL(contentUri);
        } else {
          // iOS için paylaşma menüsünü kullan
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(attachment.url);
          } else {
            throw new Error('Paylaşım özelliği kullanılamıyor');
          }
        }
        return;
      }

      // Dosya adını al
      const fileName = attachment.name;
      
      // İndirme dizinini belirle
      const downloadDir = FileSystem.documentDirectory + 'downloads/';
      
      // İndirme dizininin varlığını kontrol et
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }
      
      // Dosya yolunu oluştur
      const fileUri = downloadDir + fileName;

      // URL'yi düzelt
      let downloadUrl = attachment.url;
      if (!downloadUrl.startsWith('http')) {
        const baseUrl = api.defaults.baseURL?.replace('/api', '');
        downloadUrl = `${baseUrl}${downloadUrl}`;
      }

      console.log('Downloading file:', {
        url: downloadUrl,
        fileUri: fileUri
      });
      
      // Dosyayı indir
      const downloadResult = await FileSystem.downloadAsync(
        downloadUrl,
        fileUri
      );

      console.log('Download result:', downloadResult);
      
      if (!downloadResult) {
        throw new Error('İndirme işlemi başarısız oldu');
      }

      if (downloadResult.status === 200) {
        // Dosyayı aç
        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await Linking.openURL(contentUri);
        } else {
          // iOS için paylaşma menüsünü kullan
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(downloadResult.uri);
          } else {
            throw new Error('Paylaşım özelliği kullanılamıyor');
          }
        }
      } else {
        throw new Error(`İndirme başarısız: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert(
        'Hata',
        'Dosya açılırken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setUploading(false);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !task || !project) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <Text
            style={[
            styles.priority,
            { backgroundColor: getPriorityColor(task.priority) + '20' },
            ]}
          >
          {getPriorityText(task.priority)}
            </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Açıklama</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detaylar</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Proje</Text>
            <Text style={styles.detailValue}>{project.name}</Text>
          </View>
          {task.board_name && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Board</Text>
              <Text style={styles.detailValue}>{task.board_name}</Text>
            </View>
          )}
          {task.column_name && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Column</Text>
              <Text style={styles.detailValue}>{task.column_name}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bitiş Tarihi</Text>
            <Text style={styles.detailValue}>
              {new Date(task.due_date).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </View>

      {task.assignees && task.assignees.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atananlar</Text>
          {task.assignees.map((assignee) => (
            <View key={assignee.id} style={styles.assignee}>
              <Text style={styles.assigneeName}>{assignee.name}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dosyalar</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadFile}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload-outline" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
        {task.attachments && task.attachments.length > 0 ? (
          task.attachments.map((attachment) => (
            <TouchableOpacity
              key={attachment.id}
              style={styles.fileItem}
              onPress={() => handleFilePress(attachment)}
            >
              <View style={styles.fileInfo}>
                <Ionicons name="document-outline" size={24} color="#6b7280" />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {formatFileSize(attachment.size)} • {attachment.uploaded_by_name}
        </Text>
      </View>
              </View>
              <View style={styles.fileActions}>
                <TouchableOpacity
                  onPress={() => handleDeleteFile(attachment.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz dosya yüklenmemiş</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yorumlar</Text>
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Yorum yazın..."
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: comment.trim() ? '#2563eb' : '#9ca3af' }
            ]}
            onPress={handleAddComment}
            disabled={!comment.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
        {task.comments && task.comments.length > 0 ? (
          task.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.user_name || 'Anonim'}</Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteComment(comment.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz yorum yapılmamış</Text>
        )}
      </View>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  priority: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  details: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  assigneeName: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  fileMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
}); 