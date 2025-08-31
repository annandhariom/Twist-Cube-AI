import React, { useState, useRef, useEffect, useCallback } from 'react';
import { solveFromImages } from '../services/geminiService';
import { LearningMethod, ContentBlock } from '../types';
import { CameraIcon, BackArrowIcon, LoadingSpinnerIcon, CheckIcon, RefreshIcon } from './icons';

interface CameraSolverProps {
  method: LearningMethod;
  onBack: () => void;
}

const CUBE_FACES = ['White (Up)', 'Green (Front)', 'Red (Left)', 'Blue (Back)', 'Orange (Right)', 'Yellow (Down)'];

const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
        case 'h2':
            return <h2 key={index} className="text-2xl font-bold text-yellow-300 mt-6 mb-3 border-b-2 border-yellow-300/30 pb-2">{block.content}</h2>;
        case 'h3':
            return <h3 key={index} className="text-xl font-bold text-cyan-300 mt-4 mb-2">{block.content}</h3>;
        case 'p':
            return <p key={index} className="text-gray-300 leading-relaxed">{block.content}</p>;
        case 'algorithm':
             if (block.content && block.content.toLowerCase() !== 'n/a') {
                return (
                    <div key={index} className="my-3">
                        <pre className="bg-gray-900/50 text-lime-300 font-mono text-lg p-3 rounded-md border border-lime-300/30 whitespace-pre-wrap"><code>{block.content}</code></pre>
                    </div>
                );
            }
            return null;
        default:
            return null;
    }
}

const CameraSolver: React.FC<CameraSolverProps> = ({ method, onBack }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [solution, setSolution] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions and try again.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);

  useEffect(() => {
    if (capturedImages.length < 6) {
        startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera, capturedImages.length]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && capturedImages.length < 6) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const newImages = [...capturedImages, dataUrl];
        setCapturedImages(newImages);
        if (newImages.length === 6) {
          stopCamera();
        }
      }
    }
  };

  const handleSolve = async () => {
    if (capturedImages.length !== 6) return;
    setIsLoading(true);
    setSolution([]);
    setError(null);
    try {
      const result = await solveFromImages(capturedImages, method);
      setSolution(result);
    } catch (err) {
      setError("Failed to get solution from AI. Please try again with clearer pictures.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCapturedImages([]);
    setSolution([]);
    setError(null);
    startCamera();
  };
  
  const currentStep = capturedImages.length;

  return (
    <div className="glassmorphism p-6 rounded-xl shadow-2xl w-full animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">AI Camera Solver</h2>
            <button onClick={onBack} className="flex items-center gap-2 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors transform hover:scale-105">
                <BackArrowIcon className="w-5 h-5"/>
                Back
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
                <div className={`bg-gray-900/50 rounded-lg p-1 border flex items-center justify-center w-full aspect-video transition-all duration-300 ${currentStep < 6 ? 'border-yellow-400 pulse' : 'border-green-400'}`}>
                    {currentStep < 6 ? (
                        <video ref={videoRef} autoPlay playsInline className={`w-full h-auto rounded-md ${isCameraOn ? '' : 'hidden'}`}></video>
                    ) : (
                       <div className="text-center">
                            <CheckIcon className="w-16 h-16 text-green-400 mx-auto drop-shadow-[0_0_10px_#39ff14]"/>
                            <p className="text-gray-300 mt-4">All faces captured. Ready to solve!</p>
                       </div>
                    )}
                    {!isCameraOn && currentStep < 6 && <p className="text-gray-400">{error || "Starting camera..."}</p>}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {CUBE_FACES.map((face, index) => (
                        <div key={face} className={`aspect-square rounded-md flex items-center justify-center p-1 border-2 transition-all duration-300 ${index === currentStep ? 'border-yellow-400 scale-105 shadow-[0_0_10px_#f8f800]' : 'border-gray-600/50'}`}>
                           {capturedImages[index] ? (
                                <img src={capturedImages[index]} alt={`${face} face`} className="rounded-sm w-full h-full object-cover"/>
                           ) : (
                                <div className="text-center text-xs text-gray-400">{face}</div>
                           )}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Right Column */}
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2 text-yellow-300">Your Personalized Solution</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex-grow min-h-[300px] max-h-[60vh] overflow-y-auto">
                    {isLoading && <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><LoadingSpinnerIcon className="animate-spin h-8 w-8 mb-4"/><span>Analyzing your cube... This may take a moment.</span></div>}
                    {error && <p className="text-red-400">{error}</p>}
                    {solution.length > 0 && (
                        <div className="prose prose-invert max-w-none space-y-2">
                            {solution.map(renderContentBlock)}
                        </div>
                    )}
                    {!isLoading && solution.length === 0 && !error && <p className="text-gray-500 text-center m-auto">{currentStep < 6 ? "Capture all 6 faces of your cube to generate a solution." : "Press 'Generate Solution' to continue."}</p>}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                    {currentStep < 6 && (
                        <button onClick={captureImage} disabled={!isCameraOn} className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-105 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            <CameraIcon className="w-5 h-5"/>
                            Capture {CUBE_FACES[currentStep]}
                        </button>
                    )}
                     {currentStep === 6 && (
                        <button onClick={handleSolve} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-700 transform hover:scale-105 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                            {isLoading ? <><LoadingSpinnerIcon className="animate-spin mr-2 h-5 w-5"/> Generating...</> : <><CheckIcon className="w-5 h-5"/>Generate Solution</>}
                        </button>
                    )}
                    <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-gray-700/80 hover:bg-gray-600/80 text-white font-bold py-3 px-4 rounded-lg transition-colors transform hover:scale-105">
                        <RefreshIcon className="w-5 h-5"/>
                        {currentStep > 0 ? 'Start Over' : 'Restart Camera'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CameraSolver;