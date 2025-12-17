import React, { useState, useEffect } from 'react';
import { Trash2, Search, Mail, Clock } from 'lucide-react';
import { contactService } from '../../services/contactService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  read_status: boolean;
  created_at: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await contactService.getAll();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactService.delete(id.toString());
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  const filteredMessages = messages.filter((message) =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsRead = async (id: number) => {
    try {
      await contactService.markAsRead(id.toString());
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
        <Badge variant="accent">{messages.length} Messages</Badge>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
          <p className="text-gray-400">
            Contact form submissions will appear here
          </p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Message List */}
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <Card
                key={message.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedMessage?.id === message.id
                    ? 'ring-2 ring-cyan-500 bg-gray-700/50'
                    : 'hover:bg-gray-700/30'
                } ${
                  !message.read_status ? 'border-l-4 border-cyan-500' : ''
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read_status) {
                    handleMarkAsRead(message.id);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{message.name}</h3>
                      {!message.read_status && (
                        <Badge variant="accent" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{message.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(message.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2">{message.message}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </Card>
            ))}
          </div>

          {/* Message Detail */}
          <div className="lg:sticky lg:top-6 h-fit">
            {selectedMessage ? (
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">Message Details</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">From</label>
                    <p className="text-white font-medium">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {selectedMessage.email}
                    </a>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Message</label>
                    <div className="mt-2 p-4 bg-gray-700/50 rounded-lg">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Received</label>
                    <p className="text-white">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <Button
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `mailto:${selectedMessage.email}`,
                          '_blank'
                        )
                      }
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Reply via Email
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a message
                </h3>
                <p className="text-gray-400">
                  Click on a message to view its details
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
