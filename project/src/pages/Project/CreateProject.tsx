import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { DropdownSelect } from '../../components/ui/Dropdown';
import { useProjectStore } from '../../store/projectStore';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';

export function CreateProject() {
  const navigate = useNavigate();
  const { createProject, fetchProjects } = useProjectStore();
  const { teams, fetchTeams } = useTeamStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.name.trim()) {
        throw new Error('Project name is required');
      }
      
      if (!formData.teamId) {
        throw new Error('Please select a team');
      }
      
      const project = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        teamId: formData.teamId,
      });
      
      await fetchProjects();
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600">
            Set up a new project for your team
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Project Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Website Redesign"
                fullWidth
                required
              />
            </div>
            
            <div>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project..."
                fullWidth
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <DropdownSelect
                options={teams.map(team => ({
                  label: team.name,
                  value: team.id,
                }))}
                value={formData.teamId}
                onChange={(value) => setFormData({ ...formData, teamId: value })}
                placeholder="Select a team"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading || !formData.name.trim() || !formData.teamId}
              >
                Create Project
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 