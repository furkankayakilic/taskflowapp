import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesStackParamList } from './types';
import { ConversationsScreen } from '../screens/Messages/ConversationsScreen';
import { ChatScreen } from '../screens/Messages/ChatScreen';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export function MessagesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Conversations"
        component={ConversationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
} 