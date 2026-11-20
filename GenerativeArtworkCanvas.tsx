import React, { useEffect, useRef } from 'react';
import { EmotionAnalysisResult } from '../types';
import { Download, Sparkles } from 'lucide-react';

interface GenerativeArtworkCanvasProps {
  analysis: EmotionAnalysisResult;
  width?: number;
  height?: number;
  showCardDetails?: boolean;
}

export const GenerativeArtworkCanvas: React.FC<GenerativeArtworkCanvasProps> = ({
  analysis,
  width = 600,
  height = 360,
  showCardDetails = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Procedural organic orbs based on the emotion's colors
    const primary = analysis.palette.primaryHex;
    const secondary = analysis.palette.secondaryHex;
    const accent = analysis.palette.accentHex;

    const orbs = [
      { x: width * 0.3, y: height * 0.4, r: width * 0.35, color: primary, speed: 0.008, phase: 0 },
      { x: width * 0.7, y: height * 0.6, r: width * 0.4, color: secondary, speed: 0.006, phase: Math.PI / 2 },
      { x: width * 0.5, y: height * 0.3, r: width * 0.25, color: accent, speed: 0.01, phase: Math.PI },
      { x: width * 0.8, y: height * 0.2, r: width * 0.28, color: primary, speed: 0.007, phase: Math.PI * 1.5 }
    ];

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Base wash background
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, '#FAF9F6');
      baseGrad.addColorStop(1, '#F1EFEA');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw animated soft watercolor orbs
      orbs.forEach((orb) => {
        const currentX = orb.x + Math.sin(time * orb.speed + orb.phase) * (width * 0.06);
        const currentY = orb.y + Math.cos(time * orb.speed + orb.phase) * (height * 0.08);

        const radGrad = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, orb.r
        );

        radGrad.addColorStop(0, `${orb.color}AA`);
        radGrad.addColorStop(0.5, `${orb.color}44`);
        radGrad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, orb.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Flowing soft light particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Subtle fine film grain if requested
      if (analysis.palette.grainIntensity > 0.15) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
        for (let i = 0; i < 200; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analysis, width, height]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `sukaire-chromatica-${analysis.dominantEmotion}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md border border-white/80 bg-white/40 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto block object-cover max-h-[360px]"
      />

      {showCardDetails && (
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent flex items-end justify-between text-white">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Цифровая хроматика</span>
            </div>
            <h4 className="text-sm sm:text-base font-semibold drop-shadow-sm">
              {analysis.summaryTitle}
            </h4>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                style={{ backgroundColor: analysis.palette.primaryHex }}
                title={analysis.palette.primaryHex}
              />
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                style={{ backgroundColor: analysis.palette.secondaryHex }}
                title={analysis.palette.secondaryHex}
              />
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                style={{ backgroundColor: analysis.palette.accentHex }}
                title={analysis.palette.accentHex}
              />
              <span className="text-[11px] text-white/90 ml-1">
                {analysis.palette.primaryColorsRu}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadImage}
            title="Сохранить цифровую картину"
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all active:scale-95 border border-white/30"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
