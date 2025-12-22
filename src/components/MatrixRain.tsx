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
        const matrix = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
        const chars = matrix.split('');

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);

        // Initialize drops - one per column
        const drops: number[] = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -100; // Start at random positions above screen
        }

        const draw = () => {
            // Black background with slight transparency for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Green text
            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;

            // Draw each column
            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = chars[Math.floor(Math.random() * chars.length)];

                // Calculate position
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Draw character with glow effect for leading character
                if (drops[i] > 0) {
                    // Leading character (brighter)
                    ctx.fillStyle = '#FFF';
                    ctx.fillText(char, x, y);

                    // Reset to green for next iteration
                    ctx.fillStyle = '#0F0';
                }

                // Move drop down
                drops[i]++;

                // Reset drop to top when it goes off screen (with some randomness)
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }
        };

        // Animation loop - 35ms interval (about 28fps) for classic Matrix feel
        const intervalId = setInterval(draw, 35);

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
