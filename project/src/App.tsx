import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ProjectList } from './pages/Project/ProjectList';
import { ProjectBoard } from './pages/Project/ProjectBoard';
import { Calendar } from './pages/Calendar/Calendar';
import { Profile } from './pages/Profile/Profile';
import { Layout } from './components/Layout';
import { CreateProject } from './pages/Project/CreateProject';
import { TeamList } from './pages/Team/TeamList';
import { TeamDetails } from './pages/Team/TeamDetails';
import { CreateTeam } from './pages/Team/CreateTeam';
import { useAuthStore } from './store/authStore';
import EditProject from './pages/Project/EditProject';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {!user ? (
            <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/new" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectBoard />} />
              <Route path="/projects/:projectId/edit" element={<EditProject />} />
              <Route path="/teams" element={<TeamList />} />
              <Route path="/teams/new" element={<CreateTeam />} />
              <Route path="/teams/:teamId" element={<TeamDetails />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:userId" element={<ChatWindow />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
            duration: 3000,
          }}
        />
      </div>
    </Router>
  );
}

export default App;