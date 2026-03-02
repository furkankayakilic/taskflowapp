import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { messageService } from '../../services/messageService';
import { Conversation } from '../../types/message';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MessagesStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<MessagesStackParamList>;

export function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [email, setEmail] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const data = await messageService.getConversations();
      console.log('Conversations received:', data);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('ConversationsScreen mounted');
    fetchConversations();
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing conversations...');
    setRefreshing(true);
    fetchConversations();
  };

  const handleConversationPress = (conversation: Conversation) => {
    console.log('Conversation pressed:', conversation);
    const otherParticipant = conversation.participants?.[0];
    if (!otherParticipant) {
      console.log('No other participant found');
      return;
    }

    navigation.navigate('Chat', {
      userId: otherParticipant.id,
      userName: otherParticipant.name,
    });
  };

  const handleStartNewChat = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen bir e-posta adresi girin');
      return;
    }

    try {
      setStartingChat(true);
      const user = await messageService.startChat(email.trim());
      setShowNewChatModal(false);
      setEmail('');
      navigation.navigate('Chat', {
        userId: user.id,
        userName: user.name,
      });
    } catch (error: any) {
      Alert.alert(
        'Hata',
        error.response?.data?.message || 'Kullanıcı bulunamadı'
      );
    } finally {
      setStartingChat(false);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    console.log('Rendering conversation item:', item);
    const otherParticipant = item.participants?.[0];
    if (!otherParticipant) {
      console.log('No other participant found for item');
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => handleConversationPress(item)}
      >
        <LinearGradient
          colors={['#f3f4f6', '#fff']}
          style={styles.cardGradient}
        >
          <View style={styles.conversationContent}>
            <View style={[styles.userInitialCircle, { backgroundColor: item.unreadCount > 0 ? '#2563eb' : '#64748b' }]}>
              <Text style={styles.userInitial}>
                {otherParticipant.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.userName}>{otherParticipant.name || 'Unknown User'}</Text>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={styles.time}>
                    {item.lastMessage
                      ? formatDistanceToNow(new Date(item.lastMessage.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })
                      : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.lastMessageContainer}>
                <Text style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage
                ]} numberOfLines={1}>
                  {item.lastMessage?.content || 'Henüz mesaj yok'}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
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
          <Text style={styles.title}>Mesajlar</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowNewChatModal(true)}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.container}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz mesajınız yok</Text>
              <TouchableOpacity
                style={styles.startChatButton}
                onPress={() => setShowNewChatModal(true)}
              >
                <Text style={styles.startChatButtonText}>Yeni Sohbet Başlat</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <Modal
          visible={showNewChatModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNewChatModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yeni Sohbet</Text>
                <TouchableOpacity
                  onPress={() => setShowNewChatModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="E-posta adresi"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.startButton, startingChat && styles.startButtonDisabled]}
                onPress={handleStartNewChat}
                disabled={startingChat}
              >
                {startingChat ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.startButtonText}>Sohbet Başlat</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  conversationCard: {
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
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInitialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  unreadMessage: {
    color: '#1f2937',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  startChatButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  emailInput: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 