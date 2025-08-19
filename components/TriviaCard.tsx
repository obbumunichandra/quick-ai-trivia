import React, { useState, useEffect } from 'react';
import type { TriviaQuestion } from '../types';

interface TriviaCardProps {
  questionData: TriviaQuestion;
  onAnswerSelect: (answer: string) => void;
  userAnswer: string | null;
  showAnswer: boolean;
}

const getPlainText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};


const TriviaCard: React.FC<TriviaCardProps> = ({ questionData, onAnswerSelect, userAnswer, showAnswer }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cleanup function to cancel speech when component unmounts or question changes
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionData]);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const plainTextQuestion = getPlainText(questionData.question);
    const utterance = new SpeechSynthesisUtterance(plainTextQuestion);
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const getButtonClass = (option: string) => {
    if (!showAnswer) {
      return "bg-slate-700 hover:bg-slate-600";
    }
    if (option === questionData.correctAnswer) {
      return "bg-green-600 ring-2 ring-green-400";
    }
    if (option === userAnswer) {
      return "bg-red-600";
    }
    return "bg-slate-700 opacity-60";
  };

  const handleAnswerClick = (option: string) => {
    onAnswerSelect(option);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
      <div className="flex items-start gap-3 mb-6">
        <h3 className="flex-grow text-xl md:text-2xl font-semibold text-slate-100" dangerouslySetInnerHTML={{ __html: questionData.question }}>
        </h3>
        <button
          onClick={handleSpeak}
          aria-label="Read question aloud"
          className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 ${isSpeaking ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showAnswer}
            className={`w-full p-4 rounded-lg text-left text-white font-medium transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none ${getButtonClass(option)}`}
            dangerouslySetInnerHTML={{ __html: option }}
          >
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in">
          <h4 className="font-bold text-lg text-cyan-400 mb-2">Explanation</h4>
          <p className="text-slate-300" dangerouslySetInnerHTML={{ __html: questionData.explanation }}></p>
        </div>
      )}
    </div>
  );
};

export default TriviaCard;