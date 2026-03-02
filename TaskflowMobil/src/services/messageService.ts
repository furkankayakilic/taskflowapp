import api from './api';
import { Message, SendMessagePayload, Conversation } from '../types/message';
import axios from 'axios';

class MessageService {
  async getConversations(): Promise<Conversation[]> {
    try {
      console.log('Calling getConversations API...');
      const response = await api.get('/messages/conversations');
      console.log('Raw API response:', response.data);

      if (!response.data) {
        console.error('No data received from API');
        return [];
      }

      if (!Array.isArray(response.data)) {
        console.error('Invalid conversations data:', response.data);
        return [];
      }
      
      const conversations = response.data.map((conv: any) => {
        if (!conv) {
          console.log('Skipping null conversation');
          return null;
        }
        
        try {
          console.log('Processing conversation:', conv);
          const processed = {
            id: conv.user_id?.toString() || Math.random().toString(),
            participants: [{
              id: conv.user_id?.toString() || Math.random().toString(),
              name: conv.user_name || 'Unknown User',
              email: '',
              avatarUrl: conv.user_avatar,
            }],
            lastMessage: conv.last_message ? {
              id: Math.random().toString(),
              content: conv.last_message,
              senderId: '',
              receiverId: conv.user_id?.toString() || '',
              sender: null,
              receiver: null,
              createdAt: new Date(conv.last_message_time || Date.now()),
              updatedAt: new Date(conv.last_message_time || Date.now()),
              isRead: Number(conv.unread_count) === 0,
            } : undefined,
            unreadCount: Number(conv.unread_count) || 0,
            updatedAt: new Date(conv.last_message_time || Date.now()),
          };
          console.log('Processed conversation:', processed);
          return processed;
        } catch (err) {
          console.error('Error transforming conversation:', err, 'Raw data:', conv);
          return null;
        }
      }).filter(Boolean) as Conversation[];

      console.log('Final conversations array:', conversations);
      return conversations;
    } catch (error) {
      console.error('Error in getConversations:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      return [];
    }
  }

  async getMessages(userId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/messages/${userId}`);
      console.log('Raw messages response:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('Invalid messages data:', response.data);
        return [];
      }

      return response.data.map((msg: any) => {
        if (!msg) return null;

        try {
          const message = {
            id: msg.id?.toString() || Math.random().toString(),
            content: msg.content || '',
            senderId: msg.sender_id?.toString() || '',
            receiverId: msg.receiver_id?.toString() || '',
            sender: {
              id: msg.sender_id?.toString() || '',
              name: msg.sender_name || 'Unknown User',
              email: '',
              avatarUrl: msg.sender_avatar,
              createdAt: undefined,
              updatedAt: undefined
            },
            receiver: {
              id: msg.receiver_id?.toString() || '',
              name: 'Unknown User',
              email: '',
              avatarUrl: null,
              createdAt: undefined,
              updatedAt: undefined
            },
            createdAt: new Date(msg.created_at || Date.now()),
            updatedAt: new Date(msg.updated_at || Date.now()),
            isRead: Boolean(msg.is_read),
          };
          console.log('Transformed message:', message);
          return message;
        } catch (err) {
          console.error('Error transforming message:', err);
          return null;
        }
      }).filter(Boolean) as Message[];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  async sendMessage(payload: SendMessagePayload): Promise<Message> {
    try {
      console.log('Sending message:', payload);
      const response = await api.post(`/messages/${payload.receiverId}`, {
        content: payload.content
      });
      
      const msg = response.data;
      console.log('Message response:', msg);
      
      if (!msg) {
        throw new Error('No message data received from server');
      }

      return {
        id: msg.id?.toString() || Math.random().toString(),
        content: msg.content || '',
        senderId: msg.sender_id?.toString() || '',
        receiverId: msg.receiver_id?.toString() || '',
        sender: {
          id: msg.sender_id?.toString() || '',
          name: msg.sender_name || 'Unknown User',
          email: '',
          avatarUrl: msg.sender_avatar,
          createdAt: undefined,
          updatedAt: undefined
        },
        receiver: {
          id: msg.receiver_id?.toString() || '',
          name: 'Unknown User',
          email: '',
          avatarUrl: null,
          createdAt: undefined,
          updatedAt: undefined
        },
        createdAt: new Date(msg.created_at || Date.now()),
        updatedAt: new Date(msg.updated_at || Date.now()),
        isRead: Boolean(msg.is_read),
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await api.put(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw error;
    }
  }

  async startChat(email: string) {
    try {
      const response = await api.post('/messages/start-chat', { email });
      return {
        id: response.data.user_id.toString(),
        name: response.data.name,
        email: response.data.email,
        avatarUrl: response.data.avatar_url,
      };
    } catch (error) {
      console.error('Error in startChat:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService(); 