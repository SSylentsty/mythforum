import React, { useEffect, useState } from 'react';
import type { Card as CardType } from '../types';

interface DropModalProps {
  card: CardType;
  onClose: () => void;
}

const RARITY_COLORS = {
  COMMON: '#95a5a6',
  RARE: '#3498db',
  EPIC: '#9b59b6',
  LEGENDARY: '#f1c40f',
  MYTHIC: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)'
};

const RARITY_GLOW = {
  COMMON: '0 0 20px rgba(149, 165, 166, 0.5)',
  RARE: '0 0 30px rgba(52, 152, 219, 0.8)',
  EPIC: '0 0 50px rgba(155, 89, 182, 0.8)',
  LEGENDARY: '0 0 80px rgba(241, 196, 15, 1)',
  MYTHIC: '0 0 100px rgba(255, 0, 0, 0.8), 0 0 100px rgba(0, 0, 255, 0.8)'
};

const DropModal: React.FC<DropModalProps> = ({ card, onClose }) => {
  const [stage, setStage] = useState<'closed' | 'shaking' | 'revealed'>('closed');
  const isMythic = card.rarity === 'MYTHIC';

  useEffect(() => {
    // Sequence: Start closed -> Shake for 1.5s -> Reveal
    const shakeTimer = setTimeout(() => setStage('shaking'), 500);
    const revealTimer = setTimeout(() => setStage('revealed'), 2500);
    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {stage === 'closed' || stage === 'shaking' ? (
        <div style={{
          width: '200px', height: '300px',
          backgroundColor: '#222',
          border: '4px solid var(--accent)',
          borderRadius: '15px',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 0 30px var(--accent)',
          animation: stage === 'shaking' ? 'shake 0.5s infinite' : 'none',
          backgroundImage: 'repeating-linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), repeating-linear-gradient(45deg, #111 25%, var(--bg-primary) 25%, var(--bg-primary) 75%, #111 75%, #111)',
          backgroundPosition: '0 0, 10px 10px',
          backgroundSize: '20px 20px'
        }}>
          <div style={{ fontSize: '4rem' }}>❓</div>
        </div>
      ) : (
        <div style={{
          animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <h2 style={{ 
            color: isMythic ? '#fff' : RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS], 
            marginBottom: '2rem',
            textShadow: '0 0 10px currentColor',
            letterSpacing: '0.2em'
          }}>
            YENİ KART BULUNDU!
          </h2>
          
          <div style={{
            position: 'relative',
            width: '250px',
            height: '380px',
            borderRadius: '15px',
            background: isMythic ? '#111' : 'var(--bg-secondary)',
            border: isMythic ? '4px solid transparent' : `3px solid ${RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS]}`,
            backgroundClip: isMythic ? 'padding-box' : 'border-box',
            boxShadow: RARITY_GLOW[card.rarity as keyof typeof RARITY_GLOW],
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.5rem',
          }}>
            {isMythic && (
              <div style={{
                position: 'absolute', top: -4, right: -4, bottom: -4, left: -4,
                background: RARITY_COLORS.MYTHIC,
                zIndex: -1, borderRadius: '18px',
                animation: 'rainbow 3s linear infinite'
              }}/>
            )}
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.2em', color: isMythic ? '#fff' : RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS], marginBottom: '1rem' }}>
              {card.rarity}
            </div>
            <div style={{ fontSize: '7rem', flex: 1, display: 'flex', alignItems: 'center', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.8))' }}>
              {card.imageUrl}
            </div>
            <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{card.name}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{card.description}"</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mythic-card"
            style={{ marginTop: '3rem', padding: '1rem 3rem', fontSize: '1.2rem', cursor: 'pointer', border: '2px solid var(--accent)' }}
          >
            Envantere Ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default DropModal;
