import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { fetchOpenRouterModels } from '@/services/openrouter-service';

function Settings() {
  const { settings, updateSettings } = useAppStore();
  const [routerKey, setRouterKey] = useState(settings.openrouterApiKey || '');
  const [promptModel, setPromptModel] = useState(settings.promptModel);
  const [researchModel, setResearchModel] = useState(settings.researchModel);
  const [saved, setSaved] = useState(false);

  const { data: routerModels } = useQuery({
    queryKey: ['openrouter-models', routerKey],
    queryFn: () => fetchOpenRouterModels(routerKey),
    enabled: !!routerKey,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      openrouterApiKey: routerKey,
      promptModel,
      researchModel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="max-w-lg mt-10 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenRouter API Key</label>
          <Input
            type="text"
            value={routerKey}
            onChange={e => setRouterKey(e.target.value)}
            placeholder="or-..."
            autoComplete="off"
          />
        </div>
        {routerModels && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Creator Model</label>
              <Select value={promptModel} onChange={e => setPromptModel(e.target.value)}>
                {routerModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Research Model</label>
              <Select value={researchModel} onChange={e => setResearchModel(e.target.value)}>
                {routerModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </div>
          </>
        )}
        <Button type="submit" className="w-full">Save</Button>
        {saved && <div className="text-emerald-600 text-sm mt-2">Settings saved!</div>}
      </form>
    </Card>
  );
}

export default Settings; 