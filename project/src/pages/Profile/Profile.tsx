import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Briefcase, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { updateProfile, updateAvatar, changePassword } from '../../api/users';
import { toast } from 'react-hot-toast';

export function Profile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!user) {
    return null;
  }

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateProfile(formData);
      const updatedUser = {
        ...user,
        name: response.name,
        email: response.email,
        avatarUrl: response.avatar_url,
      };
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // TODO: Implement file upload to a storage service
        const avatarUrl = 'https://example.com/avatar.jpg'; // Replace with actual upload
        const response = await updateAvatar(avatarUrl);
        const updatedUser = {
          ...user,
          name: response.name,
          email: response.email,
          avatarUrl: response.avatar_url,
        };
        setUser(updatedUser);
        toast.success('Avatar updated successfully');
      } catch (error) {
        toast.error('Failed to update avatar');
        console.error('Avatar update error:', error);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar src={user.avatarUrl} name={user.name} size="lg" />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer hover:bg-primary/90"
                  >
                    <User size={16} />
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isEditing ? (
                  <form onSubmit={handleEditProfile} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : isChangingPassword ? (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm Password</label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Change Password</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsChangingPassword(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Mail size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsEditing(true)}
                        >
                          <User size={16} className="mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setIsChangingPassword(true)}
                        >
                          <Lock size={16} className="mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 