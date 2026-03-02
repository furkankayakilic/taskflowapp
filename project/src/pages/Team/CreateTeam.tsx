import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { useTeamStore } from '../../store/teamStore';

export function CreateTeam() {
  const navigate = useNavigate();
  const { createTeam } = useTeamStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.name.trim()) {
        throw new Error('Team name is required');
      }
      
      const team = await createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      
      navigate(`/teams/${team.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
          <p className="text-gray-600">
            Set up a new team for collaboration
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
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Development Team"
                fullWidth
                required
              />
            </div>
            
            <div>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your team..."
                fullWidth
                rows={4}
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/teams')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading || !formData.name.trim()}
              >
                Create Team
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 