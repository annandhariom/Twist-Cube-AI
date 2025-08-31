import React, { useState, useMemo, useEffect } from 'react';
import { LearningMethod, ContentBlock } from '../types';
import { CameraIcon, BackArrowIcon, NextArrowIcon, SpeakerIcon, StopIcon } from './icons';

interface LearningScreenProps {
  content: ContentBlock[];
  onBack: () => void;
  onUseCamera: () => void;
  method: LearningMethod;
}

const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
        case 'h2':
            return <h2 key={index} className="text-3xl font-bold text-yellow-300 mt-8 mb-4 border-b-2 border-yellow-300/30 pb-2 tracking-wide">{block.content}</h2>;
        case 'h3':
            return <h3 key={index} className="text-2xl font-bold text-cyan-300 mt-6 mb-3 tracking-wide">{block.content}</h3>;
        case 'p':
            return <p key={index} className="text-gray-300 leading-relaxed text-lg">{block.content}</p>;
        case 'algorithm':
             if (block.content && block.content.toLowerCase() !== 'n/a') {
                return (
                    <div key={index}>
                        <h4 className="text-lg font-semibold text-gray-400 mt-4 mb-2">Algorithm:</h4>
                        <pre className="bg-gray-900/50 text-lime-300 font-mono text-xl p-4 rounded-md border border-lime-300/30 whitespace-pre-wrap"><code>{block.content}</code></pre>
                    </div>
                );
            }
            return null;
        default:
            return null;
    }
}

const ControlButton: React.FC<{onClick: () => void, className?: string, children: React.ReactNode}> = ({onClick, className, children}) => (
    <button onClick={onClick} className={`w-1/3 sm:w-auto flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${className}`}>
        {children}
    </button>
);


const LearningScreen: React.FC<LearningScreenProps> = ({ content, onBack, onUseCamera, method }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stages = useMemo(() => {
    if (!content || content.length === 0) return [];
    
    const result: { title: string; blocks: ContentBlock[] }[] = [];
    let currentStage: { title: string; blocks: ContentBlock[] } | null = null;

    content.forEach(block => {
      if (block.type === 'h2') {
        if (currentStage) {
          result.push(currentStage);
        }
        currentStage = { title: block.content, blocks: [block] };
      } else {
        if (!currentStage) {
             currentStage = { title: 'Introduction', blocks: [] };
        }
        currentStage.blocks.push(block);
      }
    });
    if (currentStage) {
      result.push(currentStage);
    }
    return result;
  }, [content]);
  
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const handleBack = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    onBack();
  };

  const handleNext = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentPageIndex < stages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrevious = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  
  const startSpeech = () => {
    const currentStageContent = stages[currentPageIndex];
    if (!currentStageContent) return;

    const blocksToSpeak = currentStageContent.blocks
      .map(block => {
          if (block.type === 'algorithm' && block.content && block.content.toLowerCase() !== 'n/a') {
              return `Algorithm: ${block.content.split('').join(' ')}`;
          }
          if (['p', 'h2', 'h3'].includes(block.type)) {
              return block.content;
          }
          return null;
      })
      .filter((text): text is string => text !== null && text.trim() !== '');

    if (blocksToSpeak.length === 0) return;

    let currentBlockIndex = 0;

    const speakNextBlock = () => {
      if (currentBlockIndex >= blocksToSpeak.length) {
        setIsSpeaking(false);
        return;
      }
      
      const text = blocksToSpeak[currentBlockIndex];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;

      utterance.onend = () => {
        currentBlockIndex++;
        speakNextBlock();
      };
      
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error === 'interrupted') {
          return;
        }
        console.error(`Speech synthesis error: ${event.error}`, event);
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    speakNextBlock();
  };

  const handleToggleSpeech = () => {
      if (isSpeaking) {
          speechSynthesis.cancel();
          setIsSpeaking(false);
      } else {
          startSpeech();
      }
  };

  if (!stages || stages.length === 0) {
      return (
          <div className="glassmorphism p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold">No learning content available.</h2>
              <button onClick={onBack} className="mt-4 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mx-auto">
                <BackArrowIcon className="w-5 h-5" />
                Go Back
              </button>
          </div>
      );
  }

  const currentStage = stages[currentPageIndex];

  return (
    <div className="glassmorphism p-6 sm:p-8 rounded-xl shadow-2xl w-full animate-fade-in flex flex-col min-h-[60vh]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-wide">Guide: <span className="text-cyan-300">{method}</span></h2>
            </div>
            <div className="w-full sm:w-auto">
                <div className="flex gap-2 w-full">
                    <ControlButton onClick={handleBack} className="bg-gray-700/50 hover:bg-gray-600/50 text-white">
                        <BackArrowIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Back</span>
                    </ControlButton>
                    <ControlButton onClick={handleToggleSpeech} className="bg-purple-600/80 hover:bg-purple-500/80 text-white shadow-[0_0_10px_rgba(192,132,252,0.5)]">
                        {isSpeaking ? <StopIcon className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                        <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Hear'}</span>
                    </ControlButton>
                    <ControlButton onClick={onUseCamera} className="bg-blue-600/80 hover:bg-blue-500/80 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                        <CameraIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Solver</span>
                    </ControlButton>
                </div>
            </div>
        </div>
      
        <div className="prose prose-invert prose-lg max-w-none space-y-4 flex-grow">
            {currentStage && currentStage.blocks.map(renderContentBlock)}
        </div>
        
        <div className="mt-8 border-t border-gray-700/50 pt-6 flex justify-between items-center">
            <button onClick={handlePrevious} disabled={currentPageIndex === 0} className="flex items-center justify-center gap-2 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
                <BackArrowIcon className="w-5 h-5" />
                Previous
            </button>
            <div className="text-gray-400 font-semibold">
                Stage {currentPageIndex + 1} of {stages.length}
            </div>
            <button onClick={handleNext} disabled={currentPageIndex === stages.length - 1} className="flex items-center justify-center gap-2 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transform hover:scale-105">
                Next
                <NextArrowIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};

export default LearningScreen;