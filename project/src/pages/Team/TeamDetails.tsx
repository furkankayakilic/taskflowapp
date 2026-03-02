import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useTeamStore } from '../../store/teamStore';
import { useAuthStore } from '../../store/authStore';
import { Team, TeamMember, User } from '../../types';
import { DropdownSelect } from '../../components/ui/DropdownSelect';

export function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { teams, fetchTeams, loading, addTeamMember, removeTeamMember } = useTeamStore();
  const { token } = useAuthStore();
  const [error, setError] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      setError('');
      setTeam(null);
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          setError('Team not found');
          return;
        }
        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError('Failed to fetch team details');
      }
    };
    if (teamId && token) {
      fetchTeamDetails();
    }
    // Fetch all users for invite dropdown
    const fetchUsers = async () => {
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
      }
    };
    fetchUsers();
  }, [teamId, fetchTeams, token]);

  // Only show users who are not already team members
  const teamMemberIds = team?.members.map(m => m.userId) || [];
  const inviteOptions = availableUsers.filter(u => !teamMemberIds.includes(u.id));

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;
    await removeTeamMember(team.id, userId);
    // Refresh team
    const updatedTeams = await fetchTeams();
    const updatedTeam = (updatedTeams || []).find(t => String(t.id) === String(teamId));
    if (updatedTeam) setTeam(updatedTeam);
  };

  const handleInviteMember = async () => {
    if (!team || !selectedUserId) return;
    await addTeamMember(team.id, selectedUserId, 'member');
    setSelectedUserId('');
    // Refresh team
    const updatedTeams = await fetchTeams();
    const updatedTeam = (updatedTeams || []).find(t => String(t.id) === String(teamId));
    if (updatedTeam) setTeam(updatedTeam);
  };

  const handleInviteByEmail = async () => {
    setInviteError('');
    setInviteSuccess('');
    if (!team || !inviteEmail) return;
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${team.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });
      const data = await response.json();
      if (!response.ok) {
        setInviteError(data.message || 'Failed to invite user');
        return;
      }
      setInviteSuccess('User added to team!');
      setInviteEmail('');
      // Refresh team
      const updatedTeams = await fetchTeams();
      const updatedTeam = (updatedTeams || []).find(t => String(t.id) === String(teamId));
      if (updatedTeam) setTeam(updatedTeam);
    } catch (err) {
      setInviteError('Failed to invite user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Team not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600">{team.description}</p>
          </div>
          <Button onClick={() => navigate('/teams')}>
            Back to Teams
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Created {new Date(team.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
        <div className="space-y-4">
          {team.members.map((member: any) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 text-lg">
                      {member.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-900 capitalize mr-4">
                  {member.role}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h2>
        <div className="flex items-center space-x-4 mb-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Enter user email"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <Button
            onClick={handleInviteByEmail}
            disabled={!inviteEmail}
          >
            Invite
          </Button>
        </div>
        {inviteError && <div className="text-red-500 text-sm mb-2">{inviteError}</div>}
        {inviteSuccess && <div className="text-green-600 text-sm mb-2">{inviteSuccess}</div>}
      </div>
    </div>
  );
} 