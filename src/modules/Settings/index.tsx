import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import Button from '@/components/Button';

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
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded bg-background">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="w-full">Save</Button>
        {saved && <div className="text-green-600 text-sm mt-2">API key saved!</div>}
      </form>
    </div>
  );
}

export default Settings; 