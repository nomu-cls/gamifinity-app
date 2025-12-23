import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
    opacity?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ opacity = 1 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Matrix characters (Katakana + numbers + symbols)
        const matrix = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*≠∞∑∏√∂∆∇";
        const chars = matrix.split('');

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);

        // Initialize drops - one per column with random start positions
        const drops: number[] = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -50; // Start at random positions above screen
        }

        const draw = () => {
            // Fade effect - slightly transparent black overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            // Draw each column
            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = chars[Math.floor(Math.random() * chars.length)];

                // Calculate position
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Leading character - bright white/green with glow
                if (drops[i] > 0) {
                    // Glow effect
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#0f0';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(char, x, y);

                    // Second layer for brightness
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                    ctx.fillText(char, x, y);
                }

                // Trail characters - varying brightness
                for (let j = 1; j < 20; j++) {
                    const trailY = y - j * fontSize;
                    if (trailY > 0) {
                        const trailChar = chars[Math.floor(Math.random() * chars.length)];
                        const alpha = Math.max(0, 1 - (j * 0.08));
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = `rgba(0, 255, 0, ${alpha * 0.6})`;
                        ctx.fillText(trailChar, x, trailY);
                    }
                }

                // Move drop down
                drops[i]++;

                // Reset drop to top when it goes off screen (with randomness)
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
        };

        // Animation loop - 40ms interval for smooth Matrix feel
        const intervalId = setInterval(draw, 40);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity }}
        />
    );
};

export default MatrixRain;
