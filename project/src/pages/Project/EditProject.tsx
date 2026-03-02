import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useTeamStore } from '../../store/teamStore';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';

export default function EditProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, fetchProjects } = useProjectStore();
  const { teams, fetchTeams } = useTeamStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, [fetchTeams, fetchProjects]);

  useEffect(() => {
    const project = projects.find(p => String(p.id) === String(projectId));
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        teamId: project.teamId || '',
      });
    }
  }, [projects, projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProject(projectId!, {
        name: formData.name,
        description: formData.description,
        teamId: formData.teamId,
      });
      await fetchProjects();
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>
          <div>
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)} type="button">Cancel</Button>
            <Button type="submit" isLoading={loading} disabled={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 