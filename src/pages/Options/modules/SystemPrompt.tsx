import React, { useState, useEffect } from 'react';
import { StorageService } from '../../../services/storage';
import { systemPrompt as defaultSystemPrompt } from './prompt';
import { motion, AnimatePresence } from 'framer-motion';

export const SystemPrompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  ``
  useEffect(() => {
    const loadPrompt = async () => {
      const savedPrompt = await StorageService.getSystemPrompt();
      setPrompt(savedPrompt || defaultSystemPrompt);
    };
    loadPrompt();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await StorageService.saveSystemPrompt(prompt);
    setIsEditing(false);
    setTimeout(() => setIsSaving(false), 600);
  };

  const handleReset = () => {
    setPrompt(defaultSystemPrompt);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 backdrop-blur-md bg-[#fbfbfd]/80 border-b border-[#e5e5e7]"
      >
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
              系统提示词
            </h2>
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3"
                  >
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-[#0077ED] text-white text-sm font-medium rounded-full
                        hover:bg-[#0071e3] active:scale-95 transition-all duration-200
                        disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '保存中...' : '保存更改'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-full
                        hover:bg-[#e5e5e7] active:scale-95 transition-all duration-200"
                    >
                      取消
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-full
                      hover:bg-[#e5e5e7] active:scale-95 transition-all duration-200"
                  >
                    编辑
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-[#d92d20] rounded-full
                  hover:bg-[#fee4e2] active:scale-95 transition-all duration-200"
              >
                重置默认
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7]"
        >
          {isEditing ? (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-[calc(100vh-280px)] p-6 rounded-2xl bg-white 
                text-[#1d1d1f] resize-none focus:outline-none
                placeholder:text-[#86868b]"
              placeholder="在此输入系统提示词..."
              spellCheck={false}
            />
          ) : (
            <pre className="w-full h-[calc(100vh-280px)] p-6 rounded-2xl 
              whitespace-pre-wrap overflow-auto text-[#1d1d1f]"
            >
              {prompt}
            </pre>
          )}
        </motion.div>
      </div>
    </div>
  );
}; 