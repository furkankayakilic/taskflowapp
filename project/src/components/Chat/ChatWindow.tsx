import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { io, Socket } from 'socket.io-client';
import { Paperclip, File, X } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar: string;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

const ChatWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    // Initialize Socket.IO connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message === 'Authentication error') {
        navigate('/login');
      }
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, {
        ...message,
        id: String(message.id),
        sender_id: String(message.sender_id)
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, token, isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [messagesResponse, userResponse] = await Promise.all([
          api.get(`/messages/${userId}`),
          api.get(`/users/${userId}`)
        ]);
        
        // Convert number IDs to strings
        const messagesWithStringIds = messagesResponse.data.map((msg: any) => ({
          ...msg,
          id: String(msg.id),
          sender_id: String(msg.sender_id)
        }));
        
        const userWithStringId = {
          ...userResponse.data,
          id: String(userResponse.data.id)
        };
        
        setMessages(messagesWithStringIds);
        setUser(userWithStringId);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !socket || !userId) return;

    try {
      const formData = new FormData();
      if (newMessage.trim()) {
        formData.append('content', newMessage.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await api.post(`/messages/${userId}`, 
        selectedFile ? formData : { content: newMessage.trim() },
        selectedFile ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        } : undefined
      );

      const messageData = response.data;

      socket.emit('send_message', {
        receiverId: userId,
        content: newMessage,
        hasAttachment: !!selectedFile
      });

      // Convert number ID to string
      const messageWithStringId = {
        ...messageData,
        id: String(messageData.id),
        sender_id: String(messageData.sender_id)
      };

      setMessages(prev => [...prev, messageWithStringId]);
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="bg-white shadow p-4">
          <div className="animate-pulse flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="w-2/3 h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Kullanıcı bulunamadı</h2>
        <button
          onClick={() => navigate('/chat')}
          className="text-blue-600 hover:text-blue-800"
        >
          Mesajlara dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/chat')}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === userId
                ? 'justify-start'
                : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === userId
                  ? 'bg-white text-gray-800'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center p-2 rounded ${
                        message.sender_id === userId
                          ? 'bg-gray-100 hover:bg-gray-200'
                          : 'bg-blue-700 hover:bg-blue-800'
                      }`}
                    >
                      <File size={16} className="mr-2" />
                      <span className="text-sm truncate">{attachment.name}</span>
                    </a>
                  ))}
                </div>
              )}
              <p className="text-xs mt-1 opacity-75">
                {format(new Date(message.created_at), 'HH:mm', { locale: tr })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white p-4">
        {selectedFile && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <File size={16} className="mr-2 text-gray-500" />
              <span className="text-sm text-gray-600 truncate">
                {selectedFile.name}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 