import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Grid, List, LayoutList, Search, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardFooter } from '../../components/ui/Card';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { formatDate } from '../../lib/utils';
import { useProjectStore } from '../../store/projectStore';
import { useTeamStore } from '../../store/teamStore';
import { Project } from '../../types';

export function ProjectList() {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();
  const { teams, fetchTeams } = useTeamStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, [fetchProjects, fetchTeams]);
  
  // Filter projects based on search query and selected team
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTeam = selectedTeamId ? project.teamId === selectedTeamId : true;
    
    return matchesSearch && matchesTeam;
  });
  
  // Sort projects by updated date (most recent first)
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is already handled by the filter function
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
  
  // Function to calculate project completion percentage
  const getProjectCompletion = (project: Project): number => {
    const totalTasks = (project.boards || []).reduce(
      (acc, board) => acc + (board.columns || []).reduce((colAcc, col) => colAcc + ((col.tasks || []).length), 0),
      0
    );
    
    if (totalTasks === 0) return 0;
    
    const completedTasks = (project.boards || []).reduce(
      (acc, board) =>
        acc +
        (board.columns || [])
          .filter(col => col.name.toLowerCase().includes('done'))
          .reduce((colAcc, col) => colAcc + ((col.tasks || []).length), 0),
      0
    );
    
    return Math.round((completedTasks / totalTasks) * 100);
  };
  
  // Function to get team name by ID
  const getTeamName = (teamId: string | number | undefined): string => {
    if (!teamId) return 'Unknown Team';
    const team = teams.find(t => String(t.id) === String(teamId));
    return team ? team.name : 'Unknown Team';
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">
            Manage and organize your team projects
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/projects/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="button-primary"
            >
              <Plus size={18} className="mr-2" /> New Project
            </motion.button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search size={18} className="text-gray-400" />}
            fullWidth
          />
        </form>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 bg-white border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={16} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {sortedProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center mb-4">
            <List size={24} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedTeamId 
              ? 'Try changing your filters or search terms' 
              : 'Create your first project to get started'}
          </p>
          <Link to="/projects/new">
            <Button startIcon={<Plus size={16} />}>Create Project</Button>
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedProjects.map((project) => (
                <motion.div key={project.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex-grow">
                      <Link 
                        to={`/projects/${project.id}`}
                        className="inline-block mb-2"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary">
                          {project.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-4">
                        {project.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {getTeamName(project.teamId || project.team_id)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Updated {formatDate(project.updatedAt, 'MMM d, yyyy')}</span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{getProjectCompletion(project)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${getProjectCompletion(project)}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="px-6 py-4 border-t flex items-center justify-between">
                      <AvatarGroup
                        users={(project.members || []).map(m => m.user)}
                        max={3}
                        size="xs"
                      />
                      <Link 
                        to={`/projects/${project.id}`} 
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        View Project
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-lg border overflow-hidden"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Team
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Members
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Progress
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Updated
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProjects.map((project) => (
                    <motion.tr key={project.id} variants={itemVariants}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-primary rounded h-8 w-8 flex items-center justify-center text-white font-bold">
                            {project.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <Link 
                              to={`/projects/${project.id}`}
                              className="font-medium text-gray-900 hover:text-primary"
                            >
                              {project.name}
                            </Link>
                            {project.description && (
                              <p className="text-xs text-gray-500 max-w-xs truncate">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                          {getTeamName(project.teamId || project.team_id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AvatarGroup
                          users={(project.members || []).map(m => m.user)}
                          max={3}
                          size="xs"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{getProjectCompletion(project)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${getProjectCompletion(project)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(project.updatedAt, 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          View
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}