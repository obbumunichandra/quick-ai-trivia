import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import ToggleSwitch from './ToggleSwitch';
import VolumeSlider from './VolumeSlider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { isPlaying, toggleMusic, volume: musicVolume, changeVolume: changeMusicVolume } = useAudio();
  const [showAppInfo, setShowAppInfo] = useState(false);

  useEffect(() => {
    // When the modal is closed, reset its internal state to the main view.
    if (!isOpen) {
      setShowAppInfo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const handleAppInfoClick = () => {
      setShowAppInfo(true);
  }

  const handleBackToSettingsClick = () => {
      setShowAppInfo(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 m-4 text-white border border-slate-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-2xl font-bold text-cyan-400">
            {showAppInfo ? 'App Info' : 'Settings'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showAppInfo ? (
          <div className="animate-fade-in">
            <div className="text-slate-300 space-y-3 bg-slate-900/50 p-4 rounded-lg text-sm">
                <p><span className="font-semibold text-slate-100">Name:</span> Quick AI Trivia</p>
                <p><span className="font-semibold text-slate-100">Version:</span> 1.0.0</p>
                <div>
                    <span className="font-semibold text-slate-100">Description:</span>
                    <p className="mt-1">Quick AI Trivia is a cutting-edge quiz application that brings you an endless stream of unique trivia questions, powered by Google's Gemini API. Unlike traditional trivia games with static question banks, this app generates fresh, high-quality questions in real-time based on your chosen topic, difficulty, and quiz length. Whether you're a casual player or a trivia enthusiast, you can tailor the experience to your liking. Each question comes with a detailed explanation, making it not just a fun game, but also a great learning tool. Dive into any subject you can imagine, from 'Ancient Rome' to 'Quantum Physics', and challenge your knowledge like never before!</p>
                </div>
                <p><span className="font-semibold text-slate-100">Core Technology:</span> Google Gemini API</p>
                <p><span className="font-semibold text-slate-100">Built With:</span> React, TypeScript, Tailwind CSS</p>
                <p><span className="font-semibold text-slate-100">Image Source:</span> Background photos from Unsplash.</p>

                <div className="pt-4 mt-4 border-t border-slate-700 space-y-2">
                    <p><span className="font-semibold text-slate-100">Designed & Developed by:</span> Muni Chandra</p>
                    <p className="text-xs text-slate-400">© 2024 Muni Chandra. All patents and rights reserved.</p>
                </div>
           </div>
           <div className="mt-6">
                <button 
                    onClick={handleBackToSettingsClick}
                    className="w-full text-left flex items-center gap-2 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Settings
                </button>
           </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Audio Settings */}
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="music-toggle" className="font-semibold text-slate-200">Background Music</label>
                  <ToggleSwitch
                    ariaLabel="Toggle background music"
                    checked={isPlaying}
                    onChange={toggleMusic}
                  />
                </div>
                <VolumeSlider 
                    value={musicVolume}
                    onChange={(e) => changeMusicVolume(Number(e.target.value))}
                    ariaLabel="Background music volume"
                />
              </div>
            </div>

            {/* App Info Button */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={handleAppInfoClick}
                className="w-full text-left flex justify-between items-center p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors duration-200"
              >
                <span className="font-semibold text-slate-200">App Info</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;