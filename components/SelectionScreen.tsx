import React from 'react';
import { LearningMethod, Difficulty } from '../types';
import { LoadingSpinnerIcon } from './icons';

interface SelectionScreenProps {
  learningMethod: LearningMethod;
  setLearningMethod: (method: LearningMethod) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  onStartLearning: () => void;
  isLoading: boolean;
}

const getButtonStyles = (color: 'blue' | 'green' | 'orange' | 'yellow' | 'red') => {
    switch (color) {
        case 'blue': return 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/20 data-[selected=true]:bg-cyan-400 data-[selected=true]:text-gray-900 data-[selected=true]:neon-glow-blue';
        case 'green': return 'border-lime-400 text-lime-400 hover:bg-lime-400/20 data-[selected=true]:bg-lime-400 data-[selected=true]:text-gray-900 data-[selected=true]:neon-glow-green';
        case 'orange': return 'border-orange-400 text-orange-400 hover:bg-orange-400/20 data-[selected=true]:bg-orange-400 data-[selected=true]:text-gray-900';
        case 'yellow': return 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20 data-[selected=true]:bg-yellow-400 data-[selected=true]:text-gray-900';
        case 'red': return 'border-red-500 text-red-500 hover:bg-red-500/20 data-[selected=true]:bg-red-500 data-[selected=true]:text-gray-900 data-[selected=true]:neon-glow-red';
    }
};

const SelectionButton = <T,>({ value, selectedValue, onClick, children, color }: { value: T, selectedValue: T, onClick: (value: T) => void, children: React.ReactNode, color: 'blue' | 'green' | 'orange' | 'yellow' | 'red' }) => (
    <button
        onClick={() => onClick(value)}
        data-selected={selectedValue === value}
        className={`w-full px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900/0 neon-border transform hover:scale-105 ${getButtonStyles(color)}`}
    >
        {children}
    </button>
);

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  learningMethod,
  setLearningMethod,
  difficulty,
  setDifficulty,
  onStartLearning,
  isLoading,
}) => {
  return (
    <div className="glassmorphism p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4 tracking-wide">1. Choose Your Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectionButton value={LearningMethod.Beginner} selectedValue={learningMethod} onClick={setLearningMethod} color="blue">
              {LearningMethod.Beginner}
            </SelectionButton>
            <SelectionButton value={LearningMethod.CFOP} selectedValue={learningMethod} onClick={setLearningMethod} color="green">
              {LearningMethod.CFOP}
            </SelectionButton>
            <SelectionButton value={LearningMethod.Roux} selectedValue={learningMethod} onClick={setLearningMethod} color="orange">
              {LearningMethod.Roux}
            </SelectionButton>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4 tracking-wide">2. Select Difficulty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectionButton value={Difficulty.Simple} selectedValue={difficulty} onClick={setDifficulty} color="yellow">
              {Difficulty.Simple}
            </SelectionButton>
            <SelectionButton value={Difficulty.Advanced} selectedValue={difficulty} onClick={setDifficulty} color="red">
              {Difficulty.Advanced}
            </SelectionButton>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={onStartLearning}
          disabled={isLoading}
          className="w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" />
              Building Your Guide... Please wait a moment.
            </>
          ) : (
            'Start Learning'
          )}
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;