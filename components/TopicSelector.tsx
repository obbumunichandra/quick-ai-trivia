import React, { useState } from 'react';
import { TOPICS } from '../constants';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  isLoading: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, isLoading }) => {
  const [customTopic, setCustomTopic] = useState('');

  const handleSelect = (topic: string) => {
    onTopicSelect(topic);
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim() && !isLoading) {
      onTopicSelect(customTopic.trim());
      setCustomTopic('');
    }
  };

  return (
    <div className="mb-8 w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {TOPICS.map(topic => (
          <button
            key={topic}
            onClick={() => handleSelect(topic)}
            disabled={isLoading}
            className="px-5 py-2 text-white font-medium bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {topic}
          </button>
        ))}
      </div>
      <form onSubmit={handleCustomSubmit} className="flex justify-center gap-3">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Or enter your own topic..."
          disabled={isLoading}
          className="w-full max-w-sm px-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !customTopic.trim()}
          className="px-6 py-2 text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Go!
        </button>
      </form>
    </div>
  );
};

export default TopicSelector;