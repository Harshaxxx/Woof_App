import React, { useRef, useEffect, useState } from 'react';
import Card from './Card';

const ScratchCard = ({ storeName, cost, discount, description, isUnlocked, onUnlock, onReveal }) => {
    const canvasRef = useRef(null);
    const [isScratched, setIsScratched] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [ctx, setCtx] = useState(null);

    // Reset state if card changes
    useEffect(() => {
        setIsScratched(false);
        setIsRevealed(false);
    }, [storeName, cost]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            setCtx(context);

            // Draw the "Scratch Me" cover
            context.fillStyle = '#C0C0C0'; // Silver color
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Add some texture/text
            context.fillStyle = '#A0A0A0';
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);

            // Store Name on top
            context.font = 'bold 24px Arial';
            context.fillStyle = '#555';
            context.fillText(storeName, canvas.width / 2, canvas.height / 2 - 30);
        }
    }, [storeName, cost, isUnlocked]); // Re-draw if unlocked state changes (though usually it just enables interaction)

    const handleMouseMove = (e) => {
        if (!isUnlocked) return; // Block scratching if not unlocked
        if (!isScratched && ctx) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Scratch effect
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            checkScratchPercentage();
        }
    };

    const checkScratchPercentage = () => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }

        const percentage = (transparentPixels / (pixels.length / 4)) * 100;

        if (percentage > 40) { // If 40% scratched
            setIsRevealed(true);
            if (onReveal) onReveal();
        }
    };

    // For mobile touch support
    const handleTouchMove = (e) => {
        if (!isUnlocked) return;
        if (!isScratched && ctx) {
            const touch = e.touches[0];
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            checkScratchPercentage();
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '20px' }}>
            {/* Hidden Content (The Prize) */}
            <Card style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fff, #f0f0f0)',
                zIndex: 1
            }}>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>{discount}</h3>
                <p className="text-muted">{description}</p>
                <div style={{ marginTop: '10px', padding: '5px 10px', background: '#eee', borderRadius: '4px' }}>
                    {isRevealed ? 'Code Revealed!' : 'Scratch to Reveal'}
                </div>
            </Card>

            {/* Scratch Layer */}
            {!isRevealed && (
                <>
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={200}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2,
                            cursor: isUnlocked ? 'crosshair' : 'default',
                            borderRadius: '12px'
                        }}
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleTouchMove}
                    />

                    {/* Locked Overlay */}
                    {!isUnlocked && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px'
                        }}>
                            <button
                                onClick={onUnlock}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    background: 'var(--color-primary)',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                                }}
                            >
                                Play for {cost} 🦴
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ScratchCard;
