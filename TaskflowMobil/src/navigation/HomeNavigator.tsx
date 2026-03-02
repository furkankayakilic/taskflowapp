import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { TeamsScreen } from '../screens/home/TeamsScreen';
import { ProjectsScreen } from '../screens/home/ProjectsScreen';
import { ProfileScreen } from '../screens/home/ProfileScreen';
import { TeamDetailsScreen } from '../screens/home/TeamDetailsScreen';
import { ProjectDetailsScreen } from '../screens/home/ProjectDetailsScreen';
import { TaskDetailsScreen } from '../screens/home/TaskDetailsScreen';
import { ConversationsScreen } from '../screens/Messages/ConversationsScreen';
import { ChatScreen } from '../screens/Messages/ChatScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<HomeStackParamList>();

// Messages stack navigator
const MessagesStack = () => {
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
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Teams') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Projects') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbox' : 'chatbox-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Teams" component={TeamsScreen} options={{ title: 'Takımlar' }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: 'Projeler' }} />
      <Tab.Screen name="Messages" component={MessagesStack} options={{ title: 'Mesajlar' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};

export const HomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Dashboard" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} options={{ title: 'Takım Detayları' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Proje Detayları' }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: 'Görev Detayları' }} />
    </Stack.Navigator>
  );
}; 