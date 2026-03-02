import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MessagesStackParamList = {
  Conversations: undefined;
  Chat: { userId: string; userName: string };
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Teams: undefined;
  TeamDetails: { teamId: number };
  Projects: undefined;
  ProjectDetails: { projectId: number };
  TaskDetails: { taskId: number; projectId: number };
  Profile: undefined;
  CreateProject: undefined;
  CreateTask: { projectId: number };
  CreateTeam: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Home: NavigatorScreenParams<HomeStackParamList>;
};

export type NavigationProp = {
  navigate: (screen: keyof HomeStackParamList, params?: any) => void;
  goBack: () => void;
}; 