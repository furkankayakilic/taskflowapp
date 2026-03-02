import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Plus, Search, Mail } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

const ChatList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        // Convert number IDs to strings
        const conversationsWithStringIds = response.data.map((conv: any) => ({
          ...conv,
          user_id: String(conv.user_id)
        }));
        setConversations(conversationsWithStringIds);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [navigate, isAuthenticated]);

  const handleStartChat = async () => {
    try {
      setError('');
      const response = await api.post('/messages/start-chat', { email });
      if (response.data.user_id) {
        // Convert number ID to string
        navigate(`/chat/${String(response.data.user_id)}`);
        setShowEmailForm(false);
        setEmail('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Kullanıcı bulunamadı.');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto mt-8 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Mesajlar</h2>
          <button
            onClick={() => setShowEmailForm(true)}
            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
          >
            <Plus size={24} />
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Henüz mesajınız yok</h2>
            <p className="text-gray-600 mb-4">
              E-posta adresi ile yeni bir sohbet başlatın.
            </p>
            <button
              onClick={() => setShowEmailForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Yeni Sohbet Başlat
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <div
                key={conversation.user_id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/chat/${conversation.user_id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={conversation.user_avatar || '/default-avatar.png'}
                      alt={conversation.user_name}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.user_name}
                      </p>
                      {conversation.last_message_time && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(conversation.last_message_time), 'HH:mm', { locale: tr })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Yeni Sohbet</h3>
                <button
                  onClick={() => {
                    setShowEmailForm(false);
                    setError('');
                    setEmail('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="E-posta adresi girin..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg pl-10"
                  />
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button
                  onClick={handleStartChat}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Sohbet Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList; 