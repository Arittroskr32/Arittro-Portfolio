import React, { useEffect, useState } from 'react';
import { Save, Github, Mail, User, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contactService, SiteSettings } from '../../services/contactService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { GITHUB_BRANCH, GITHUB_REPO } from '../../services/config';

const Settings: React.FC = () => {
  const { admin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    contactService.getSettings().then(setSettings).catch(() => setSettings({}));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setSaving(true);
      await contactService.updateSettings({
        contact_email: settings.contact_email || '',
        contact_form_endpoint: settings.contact_form_endpoint || '',
        contact_form_access_key: settings.contact_form_access_key || '',
      });
      setMessage({ type: 'success', text: 'Settings saved. They go live after the next deploy (about a minute).' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Admin account and contact form</p>
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
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Signed in
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <Github className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">GitHub account</p>
                <p className="text-white font-medium">{admin?.login || admin?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
              <KeyRound className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Saving to</p>
                <p className="text-white font-medium">
                  {GITHUB_REPO} · branch {GITHUB_BRANCH}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            There is no password any more. Access is controlled by your GitHub token. To revoke access, delete the token at{' '}
            <a className="text-cyan-400 hover:underline" href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener noreferrer">
              github.com/settings/personal-access-tokens
            </a>
            .
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact form
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            GitHub Pages cannot store messages, so the contact form either sends through a free form service or opens the
            visitor's email app addressed to you. Leave the endpoint empty to use the email app.
          </p>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Your email (where messages go)"
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
            <Input
              label="Form endpoint (optional), e.g. https://formspree.io/f/xxxxxx or https://api.web3forms.com/submit"
              type="url"
              value={settings.contact_form_endpoint || ''}
              onChange={(e) => setSettings({ ...settings, contact_form_endpoint: e.target.value })}
            />
            <Input
              label="Access key (only for Web3Forms)"
              value={settings.contact_form_access_key || ''}
              onChange={(e) => setSettings({ ...settings, contact_form_access_key: e.target.value })}
            />
            <div className="pt-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save settings'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
