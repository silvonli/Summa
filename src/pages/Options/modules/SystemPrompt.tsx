import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage';
import { systemPrompt as defaultSystemPrompt } from '../../Background/prompt';

export const SystemPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      const savedPrompt = await StorageService.getSystemPrompt();
      setPrompt(savedPrompt || defaultSystemPrompt);
    };
    loadPrompt();
  }, []);

  const handleSave = async () => {
    await StorageService.saveSystemPrompt(prompt);
    setIsEditing(false);
  };

  const handleReset = () => {
    setPrompt(defaultSystemPrompt);
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">系统提示设置</h2>
        <div className="space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              编辑
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            重置为默认
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isEditing ? (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-[600px] p-4 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ) : (
          <pre className="w-full h-[600px] p-4 border rounded-md bg-muted whitespace-pre-wrap overflow-auto">
            {prompt}
          </pre>
        )}
      </div>
    </div>
  );
}; 