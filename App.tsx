import React, { useState, useCallback } from 'react';
import { LearningMethod, Difficulty, View, ContentBlock } from './types';
import SelectionScreen from './components/SelectionScreen';
import LearningScreen from './components/LearningScreen';
import CameraSolver from './components/CameraSolver';
import { getLearningSteps } from './services/geminiService';
import { CubeIcon } from './components/icons';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Selection);
  const [learningMethod, setLearningMethod] = useState<LearningMethod>(LearningMethod.Beginner);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Simple);
  const [learningContent, setLearningContent] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartLearning = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLearningContent([]);
    try {
      const content = await getLearningSteps(learningMethod, difficulty);
      setLearningContent(content);
      setView(View.Learning);
    } catch (err) {
      setError('Failed to generate the learning guide. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [learningMethod, difficulty]);

  const resetToSelection = () => {
    setView(View.Selection);
    setLearningContent([]);
    setError(null);
  };

  const renderContent = () => {
    switch (view) {
      case View.Selection:
        return (
          <SelectionScreen
            learningMethod={learningMethod}
            setLearningMethod={setLearningMethod}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStartLearning={handleStartLearning}
            isLoading={isLoading}
          />
        );
      case View.Learning:
        return (
          <LearningScreen
            content={learningContent}
            onBack={resetToSelection}
            onUseCamera={() => setView(View.Camera)}
            method={learningMethod}
          />
        );
      case View.Camera:
        return (
            <CameraSolver 
                method={learningMethod}
                onBack={() => setView(View.Learning)}
            />
        );
      default:
        return (
          <SelectionScreen
            learningMethod={learningMethod}
            setLearningMethod={setLearningMethod}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStartLearning={handleStartLearning}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen font-poppins flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex items-center justify-center gap-3">
            <CubeIcon className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_5px_#00f6ff]" />
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#ff073a] via-[#f8f800] to-[#00f6ff]">
                Twist Cube AI
            </h1>
        </div>
        <p className="text-gray-400 mt-2 text-lg">Unlock the cube's secrets with the power of AI.</p>
      </header>
      <main className="w-full max-w-4xl flex-grow">
        {error && (
            <div className="glassmorphism border-red-500/50 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {renderContent()}
      </main>
      <footer className="w-full text-center mt-auto pt-8 pb-4">
        <p className="text-xs text-gray-700">Built by Anand</p>
      </footer>
    </div>
  );
};

export default App;