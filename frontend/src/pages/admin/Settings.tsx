import React, { useState } from 'react';
import { Save, Lock, Mail, User } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const Settings: React.FC = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password. Please check your current password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your admin account credentials</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Current Account Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{admin?.email || 'arittroskr@gmail.com'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <p className="text-white font-medium">Administrator</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password *
              </label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password *
              </label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                minLength={6}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                placeholder="Confirm new password"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Tips */}
        <Card className="p-6 bg-cyan-500/10 border-cyan-500/20">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            Security Best Practices
          </h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Use a strong password with at least 12 characters</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Include uppercase, lowercase, numbers, and special characters</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Don't use the same password for multiple accounts</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Change your password regularly (every 3-6 months)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Never share your admin credentials with anyone</span>
            </li>
          </ul>
        </Card>

        {/* Password Requirements */}
        <Card className="p-6 bg-gray-700/30">
          <h3 className="text-lg font-bold text-white mb-3">Password Requirements</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
              <span>Minimum 6 characters (12+ recommended)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
              <span>Must be different from current password</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
              <span>Both new password fields must match</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
