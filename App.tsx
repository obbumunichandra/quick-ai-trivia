import React, { useState, useCallback, useMemo } from 'react';
import type { TriviaQuestion } from './types';
import { generateTriviaQuestion } from './services/geminiService';
import { TOPIC_BACKGROUNDS } from './constants';
import Header from './components/Header';
import TopicSelector from './components/TopicSelector';
import TriviaCard from './components/TriviaCard';
import Spinner from './components/Spinner';
import Footer from './components/Footer';
import Settings from './components/Settings';
import SettingsModal from './components/SettingsModal';

type GameState = 'topic' | 'difficulty' | 'length' | 'quiz' | 'results';
type Difficulty = 'basic' | 'medium' | 'advanced';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('topic');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [quizLength, setQuizLength] = useState<number>(20);
  const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const backgroundStyle = useMemo(() => {
    // Find a matching key, case-insensitive, default to 'default' for home page or custom topics
    const topicKey = Object.keys(TOPIC_BACKGROUNDS).find(key => key.toLowerCase() === topic.toLowerCase()) || 'default';
    const imageUrl = TOPIC_BACKGROUNDS[topicKey];

    return {
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.70), rgba(15, 23, 42, 0.85)), url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      transition: 'background-image 0.7s ease-in-out',
    };
  }, [topic]);

  const fetchQuestion = useCallback(async (currentTopic: string, currentDifficulty: Difficulty, previousQuestions: string[]) => {
    setIsLoading(true);
    setError(null);
    setTriviaQuestion(null);
    setUserAnswer(null);
    setShowAnswer(false);
    
    // Stop any currently speaking TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const question = await generateTriviaQuestion(currentTopic, currentDifficulty, previousQuestions);
      setTriviaQuestion(question);
      setAskedQuestions(prev => [...prev, question.question]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setGameState('difficulty');
  };
  
  const handleDifficultySelect = (selectedDifficulty: Difficulty) => {
      setDifficulty(selectedDifficulty);
      setGameState('length');
  }

  const handleLengthSelect = (length: number) => {
    if (!topic || !difficulty) return;
    setQuizLength(length);
    setScore(0);
    setQuestionNumber(1);
    setAskedQuestions([]);
    setGameState('quiz');
    fetchQuestion(topic, difficulty, []);
  };
  
  const handleBack = useCallback(() => {
    if (gameState === 'length') {
      setGameState('difficulty');
    } else if (gameState === 'difficulty') {
      setGameState('topic');
    }
  }, [gameState]);

  const handleAnswerSelect = (answer: string) => {
    if (showAnswer) return; // Prevent answering multiple times
    
    setUserAnswer(answer);
    if (triviaQuestion && answer === triviaQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (questionNumber < quizLength) {
      setQuestionNumber(prev => prev + 1);
      if (topic && difficulty) {
        fetchQuestion(topic, difficulty, askedQuestions);
      }
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('topic');
    setTopic('');
    setDifficulty(null);
    setTriviaQuestion(null);
    setError(null);
    setUserAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setQuestionNumber(0);
    setAskedQuestions([]);
  };

  const getResultsMessage = () => {
      const percentage = (score / quizLength) * 100;
      if (percentage === 100) return "Perfect Score! You're a trivia master!";
      if (percentage >= 80) return "Excellent! You really know your stuff!";
      if (percentage >= 50) return "Great job! A very respectable score.";
      if (percentage >= 20) return "Not bad! Keep practicing.";
      return "Better luck next time! Why not try another round?";
  };
  
  const handleOpenSettings = () => {
      setIsSettingsOpen(true);
  }

  return (
    <div className="min-h-screen text-white flex flex-col px-4" style={backgroundStyle}>
      <Settings onOpen={handleOpenSettings} />
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center w-full py-8">
        
        {gameState === 'topic' && (
          <div className="flex flex-col items-center justify-center animate-fade-in text-center">
            <TopicSelector onTopicSelect={handleTopicSelect} isLoading={isLoading} />
            <div className="text-slate-400 mt-8">
              <p className="text-2xl font-medium">Ready for a challenge?</p>
              <p className="text-lg">Select a topic to start!</p>
            </div>
          </div>
        )}

        {gameState === 'difficulty' && (
          <div className="w-full max-w-2xl text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-slate-200 mb-2">Topic: <span className="text-cyan-400">{topic}</span></h2>
              <p className="text-xl text-slate-400 mb-8">Choose your difficulty level.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {(['basic', 'medium', 'advanced'] as Difficulty[]).map(level => (
                      <button
                          key={level}
                          onClick={() => handleDifficultySelect(level)}
                          className="px-8 py-4 text-white font-semibold bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors duration-300 shadow-lg hover:shadow-cyan-800/50 w-full sm:w-auto capitalize text-lg"
                      >
                          {level}
                      </button>
                  ))}
              </div>
              <div className="mt-8">
                  <button onClick={handleBack} className="px-4 py-2 text-slate-400 font-medium hover:text-white transition-colors duration-200">
                      &larr; Back to Topics
                  </button>
              </div>
          </div>
        )}

        {gameState === 'length' && (
          <div className="w-full max-w-2xl text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-slate-200 mb-2">Topic: <span className="text-cyan-400">{topic}</span></h2>
              <p className="text-xl text-slate-400 mb-2">Difficulty: <span className="font-semibold capitalize">{difficulty}</span></p>
              <p className="text-xl text-slate-400 mb-8">How many questions?</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {([10, 20, 50]).map(length => (
                      <button
                          key={length}
                          onClick={() => handleLengthSelect(length)}
                          className="px-8 py-4 text-white font-semibold bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors duration-300 shadow-lg hover:shadow-cyan-800/50 w-full sm:w-auto capitalize text-lg"
                      >
                          {length} Questions
                      </button>
                  ))}
              </div>
              <div className="mt-8">
                <button onClick={handleBack} className="px-4 py-2 text-slate-400 font-medium hover:text-white transition-colors duration-200">
                    &larr; Back to Difficulty
                </button>
              </div>
          </div>
        )}

        {gameState === 'quiz' && (
          <div className="w-full flex flex-col items-center justify-center flex-grow animate-fade-in">
            <div className="w-full max-w-2xl mb-4 flex justify-between items-center text-lg font-semibold text-slate-300">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full tabular-nums">Score: {score}</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full tabular-nums">Question: {questionNumber} / {quizLength}</span>
             </div>

            <div className="w-full max-w-2xl flex-grow flex items-center justify-center">
              {isLoading && <Spinner />}
              
              {error && !isLoading && (
                <div className="w-full max-w-2xl mx-auto p-4 my-4 text-center bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                  <p className="font-semibold">Oops! Something went wrong.</p>
                  <p>{error}</p>
                </div>
              )}

              {triviaQuestion && !isLoading && (
                <TriviaCard
                  questionData={triviaQuestion}
                  onAnswerSelect={handleAnswerSelect}
                  userAnswer={userAnswer}
                  showAnswer={showAnswer}
                />
              )}
            </div>
            
            <div className="h-20 mt-6 flex items-center justify-center gap-4">
                {error && !isLoading && (
                    <div className="animate-fade-in">
                        <button
                            onClick={resetGame}
                            className="px-8 py-3 text-white font-semibold bg-slate-600 rounded-full hover:bg-slate-500 transition-colors duration-300 shadow-lg hover:shadow-slate-600/50"
                        >
                            Start New Quiz
                        </button>
                    </div>
                )}
                {showAnswer && !error && !isLoading && (
                    <div className="animate-fade-in">
                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-3 text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/50"
                        >
                            {questionNumber < quizLength ? 'Next Question' : 'Show Results'}
                        </button>
                    </div>
                )}
            </div>
          </div>
        )}

        {gameState === 'results' && (
            <div className="w-full max-w-2xl text-center bg-slate-800 p-8 rounded-xl shadow-2xl animate-fade-in">
                <h2 className="text-3xl font-bold text-cyan-400 mb-2">Quiz Complete!</h2>
                <p className="text-lg text-slate-300">Topic: <span className="font-semibold">{topic}</span></p>
                <p className="text-lg text-slate-300 mb-6">Difficulty: <span className="font-semibold capitalize">{difficulty}</span></p>

                <p className="text-5xl font-bold text-white my-4">{score} / {quizLength}</p>
                <p className="text-lg text-slate-400 mb-8">{getResultsMessage()}</p>
                 <button
                    onClick={resetGame}
                    className="px-10 py-4 text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                 >
                    Play Again
                </button>
            </div>
        )}
      </main>
      <Footer />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;