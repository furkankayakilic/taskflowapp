import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Squares2X2Icon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useTeamStore } from '../../store/teamStore';
import { useProjectStore } from '../../store/projectStore';

export function Dashboard() {
  const { user } = useAuthStore();
  const { teams, fetchTeams } = useTeamStore();
  const { projects, fetchProjects } = useProjectStore();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchTeams(), fetchProjects()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadData();
  }, [fetchTeams, fetchProjects]);
  
  // Get recent projects (last 4)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  
  // Calculate statistics
  const totalTasks = projects.reduce((acc, project) => {
    return acc + (project.boards?.reduce((boardAcc, board) => {
      return boardAcc + (board.columns?.reduce((colAcc, col) => {
        return colAcc + (col.tasks?.length || 0);
      }, 0) || 0);
    }, 0) || 0);
  }, 0);
  
  const completedTasks = projects.reduce((acc, project) => {
    return acc + (project.boards?.reduce((boardAcc, board) => {
      return boardAcc + (board.columns
        ?.filter(col => col.name.toLowerCase().includes('done'))
        .reduce((colAcc, col) => {
          return colAcc + (col.tasks?.length || 0);
        }, 0) || 0);
    }, 0) || 0);
  }, 0);
  
  const inProgressTasks = projects.reduce((acc, project) => {
    return acc + (project.boards?.reduce((boardAcc, board) => {
      return boardAcc + (board.columns
        ?.filter(col => col.name.toLowerCase().includes('progress'))
        .reduce((colAcc, col) => {
          return colAcc + (col.tasks?.length || 0);
        }, 0) || 0);
    }, 0) || 0);
  }, 0);
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/projects/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Create New Project
            </motion.button>
          </Link>
        </div>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
            </div>
            <div>
              <div className="flex items-center">
                <div className="mr-4 bg-primary/10 p-3 rounded-full">
                  <Squares2X2Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{projects.length}</div>
                  <p className="text-xs text-gray-500">Active projects</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Teams</h3>
            </div>
            <div>
              <div className="flex items-center">
                <div className="mr-4 bg-indigo-100 p-3 rounded-full">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{teams.length}</div>
                  <p className="text-xs text-gray-500">Working teams</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
            </div>
            <div>
              <div className="flex items-center">
                <div className="mr-4 bg-green-100 p-3 rounded-full">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{completedTasks}</div>
                  <p className="text-xs text-gray-500">Finished tasks</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            </div>
            <div>
              <div className="flex items-center">
                <div className="mr-4 bg-amber-100 p-3 rounded-full">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{inProgressTasks}</div>
                  <p className="text-xs text-gray-500">Active tasks</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-lg font-medium">Recent Projects</h3>
            </div>
              <div className="space-y-4">
                {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No projects yet</p>
                ) : (
                  recentProjects.map((project) => (
                    <div 
                      key={project.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      View Project
                        </Link>
                    </div>
                  ))
                )}
              </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="pb-2">
              <h3 className="text-lg font-medium">Activity Overview</h3>
                  </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 bg-primary/10 p-3 rounded-full">
                    <ChartBarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Task Completion</div>
                    <p className="text-sm text-gray-500">{completionRate}% completed</p>
                  </div>
                </div>
      </div>
      
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 bg-indigo-100 p-3 rounded-full">
                    <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium">Team Collaboration</div>
                    <p className="text-sm text-gray-500">{teams.length} active teams</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </motion.div>
      </div>
    </div>
  );
}