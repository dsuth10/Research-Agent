import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';

function Settings() {
  const { settings, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.openaiApiKey || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ openaiApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-lg mt-10 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          <Input
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="w-full">Save</Button>
        {saved && <div className="text-emerald-600 text-sm mt-2">API key saved!</div>}
      </form>
    </Card>
  );
}

export default Settings; 