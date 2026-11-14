import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Inbox } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { contactService, SiteSettings } from '../../services/contactService';

// The site is static now, so contact messages are not stored on the site.
// They arrive in the inbox of the form service or the owner's email.
const ContactMessages: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    contactService.getSettings().then(setSettings).catch(() => setSettings({}));
  }, []);

  const endpoint = settings?.contact_form_endpoint || '';
  const service = endpoint.includes('formspree')
    ? { name: 'Formspree', url: 'https://formspree.io/forms' }
    : endpoint.includes('web3forms')
      ? { name: 'Web3Forms', url: 'https://app.web3forms.com/' }
      : null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Contact Messages</h1>
      <p className="text-gray-400 mb-6">Where messages from your contact form go.</p>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Inbox className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">
            {endpoint ? `Sent through ${service?.name || 'your form service'}` : 'Sent to your email'}
          </h2>
        </div>
        {endpoint ? (
          <p className="text-gray-300 text-sm">
            Messages are delivered to the email you registered with {service?.name || 'the form service'}
            {service && (
              <>
                {' '}and are listed in its{' '}
                <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  dashboard
                </a>
              </>
            )}
            .
          </p>
        ) : (
          <p className="text-gray-300 text-sm flex items-start gap-2">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            The form opens the visitor's email app with a message addressed to{' '}
            <b>{settings?.contact_email || 'your email'}</b>. You can switch to a form service in{' '}
            <Link to="/admin/settings" className="text-cyan-400 hover:underline">
              Settings
            </Link>
            .
          </p>
        )}
      </Card>
    </div>
  );
};

export default ContactMessages;
