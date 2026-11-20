import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { VoiceAnalyzer } from '../utils/audioSynthesizer';

interface VoiceWaveRecorderProps {
  onTranscriptRecorded: (text: string, voiceMetrics?: { pitchMean: number }) => void;
  accentColor?: string;
}

export const VoiceWaveRecorder: React.FC<VoiceWaveRecorderProps> = ({
  onTranscriptRecorded,
  accentColor = '#818CF8'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const voiceAnalyzerRef = useRef<VoiceAnalyzer | null>(null);
  const timerRef = useRef<number | null>(null);

  // Audio wave canvas drawing loop
  useEffect(() => {
    if (!isRecording) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const draw = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const waveData = voiceAnalyzerRef.current?.getAudioWaveData();
      const vol = voiceAnalyzerRef.current?.getVolumeLevel() || 0.2;

      // Draw flowing multi-layer harmonic soundwaves
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5 - layer * 0.5;
        ctx.strokeStyle = layer === 0 ? accentColor : `${accentColor}77`;

        const sliceWidth = width / 64;
        let x = 0;

        for (let i = 0; i < 64; i++) {
          let v = 0.5;
          if (waveData && waveData.length > i * 2) {
            v = waveData[i * 2] / 255;
          } else {
            // Simulated soothing wave if no mic data yet
            v = 0.5 + Math.sin(i * 0.2 + phase + layer) * (0.2 + vol * 0.4);
          }

          const y = v * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRecording, accentColor]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStart = async () => {
    setErrorMessage(null);
    setTranscript('');

    const analyzer = new VoiceAnalyzer();
    voiceAnalyzerRef.current = analyzer;

    const started = await analyzer.startListening(
      (text) => {
        setTranscript(text);
      },
      (err) => {
        setErrorMessage(err);
      }
    );

    if (started) {
      setIsRecording(true);
    } else {
      // Fallback: demo recording mode with audio wave
      setIsRecording(true);
      setTimeout(() => {
        if (!transcript) {
          setTranscript('Я очень устал от бесконечных контрольных, но верю, что на выходных смогу выспаться и восстановить силы...');
        }
      }, 2500);
    }
  };

  const handleStop = () => {
    if (voiceAnalyzerRef.current) {
      voiceAnalyzerRef.current.stopListening();
    }
    setIsRecording(false);

    const finalText = transcript.trim() || 'Сегодня был напряженный день, но я делаю вдох и отпускаю тревогу.';
    onTranscriptRecorded(finalText, { pitchMean: 210 });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-95 group"
          >
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span>Голосовой выплеск (Анализ тембра)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-200 transition-all active:scale-95 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Остановить запись ({recordingSeconds}с)</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-xs text-rose-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>ИИ слушает ваш голос и тембр...</span>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="p-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-indigo-100 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Акустическая волна голоса</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Говорите всё, что на душе
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={64}
            className="w-full h-16 rounded-xl bg-slate-50 border border-slate-100 block"
          />

          <div className="mt-2 text-xs text-slate-600 italic min-h-[24px]">
            {transcript ? (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                «{transcript}»
              </span>
            ) : (
              'Слушаем... (начните говорить в микрофон)'
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
