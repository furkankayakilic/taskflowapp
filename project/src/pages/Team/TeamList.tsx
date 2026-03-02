import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useTeamStore } from '../../store/teamStore';
import { Team } from '../../types';

export function TeamList() {
  const navigate = useNavigate();
  const { teams, fetchTeams, loading } = useTeamStore();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams().catch(err => {
      setError('Failed to fetch teams');
      console.error(err);
    });
  }, [fetchTeams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and members</p>
        </div>
        <Button onClick={() => navigate('/teams/new')}>
          Create Team
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/teams/${team.id}`)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {team.name}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {team.description}
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">
                {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
              </span>
              <span>
                Created {new Date(team.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No teams found
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first team to start collaborating
          </p>
          <Button onClick={() => navigate('/teams/new')}>
            Create Team
          </Button>
        </div>
      )}
    </div>
  );
} 