import React, { useState } from 'react';
import type { Card as CardType, UserCard } from '../types';
import DropModal from './DropModal';

// Mock data for demonstration until backend drop logic is fully implemented
const MOCK_AVAILABLE_CARDS: CardType[] = [
  { id: 'c1', name: 'Zeus', description: 'Gökyüzü ve şimşek tanrısı.', rarity: 'LEGENDARY', imageUrl: '⚡', dropChance: 0.05 },
  { id: 'c2', name: 'Odin', description: 'Bilgelik, savaş ve ölüm tanrısı.', rarity: 'MYTHIC', imageUrl: '👁️', dropChance: 0.01 },
  { id: 'c3', name: 'Anubis', description: 'Ölülerin koruyucusu ve mumyalama tanrısı.', rarity: 'EPIC', imageUrl: '🐺', dropChance: 0.15 },
  { id: 'c4', name: 'Ülgen', description: 'İyilik tanrısı, göğün 16. katında oturur.', rarity: 'LEGENDARY', imageUrl: '☀️', dropChance: 0.05 },
  { id: 'c5', name: 'Erlik Han', description: 'Yeraltı aleminin hakimi.', rarity: 'EPIC', imageUrl: '🔥', dropChance: 0.15 },
  { id: 'c6', name: 'Centaur', description: 'Yarı insan yarı at.', rarity: 'COMMON', imageUrl: '🐎', dropChance: 0.50 },
  { id: 'c7', name: 'Valkyrie', description: 'Savaş alanında ölenleri seçen bakireler.', rarity: 'RARE', imageUrl: '🛡️', dropChance: 0.30 },
];

const MOCK_USER_INVENTORY: UserCard[] = [
  { id: 'u1', userId: 'me', cardId: 'c1', quantity: 1, acquiredAt: Date.now() },
  { id: 'u2', userId: 'me', cardId: 'c6', quantity: 4, acquiredAt: Date.now() },
  { id: 'u3', userId: 'me', cardId: 'c7', quantity: 2, acquiredAt: Date.now() },
];

const RARITY_COLORS = {
  COMMON: '#95a5a6',
  RARE: '#3498db',
  EPIC: '#9b59b6',
  LEGENDARY: '#f1c40f',
  MYTHIC: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)'
};

const RARITY_GLOW = {
  COMMON: 'none',
  RARE: '0 0 10px rgba(52, 152, 219, 0.5)',
  EPIC: '0 0 15px rgba(155, 89, 182, 0.6)',
  LEGENDARY: '0 0 20px rgba(241, 196, 15, 0.7)',
  MYTHIC: '0 0 30px rgba(255, 0, 0, 0.5), 0 0 40px rgba(0, 0, 255, 0.5)'
};

const CardDisplay: React.FC<{ card: CardType, quantity: number }> = ({ card, quantity }) => {
  const isMythic = card.rarity === 'MYTHIC';
  
  return (
    <div style={{
      position: 'relative',
      width: '200px',
      height: '300px',
      borderRadius: '15px',
      background: isMythic ? '#111' : 'var(--bg-secondary)',
      border: isMythic ? '3px solid transparent' : `2px solid ${RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS]}`,
      backgroundClip: isMythic ? 'padding-box' : 'border-box',
      boxShadow: RARITY_GLOW[card.rarity as keyof typeof RARITY_GLOW],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transformStyle: 'preserve-3d',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
      if (isMythic) e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 0, 200, 0.8), 0 0 60px rgba(0, 255, 255, 0.8)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      if (isMythic) e.currentTarget.style.boxShadow = RARITY_GLOW.MYTHIC;
    }}
    >
      {/* Mythic Border Gradient */}
      {isMythic && (
        <div style={{
          position: 'absolute', top: -3, right: -3, bottom: -3, left: -3,
          background: RARITY_COLORS.MYTHIC,
          zIndex: -1,
          borderRadius: '17px',
          animation: 'rainbow 3s linear infinite'
        }}/>
      )}

      {/* Quantity Badge */}
      {quantity > 1 && (
        <div style={{
          position: 'absolute', top: '-10px', right: '-10px',
          background: 'var(--accent)', color: '#000',
          width: '30px', height: '30px', borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontWeight: 'bold', border: '2px solid var(--bg-primary)',
          zIndex: 10
        }}>
          x{quantity}
        </div>
      )}

      {/* Rarity Label */}
      <div style={{
        fontSize: '0.6rem',
        fontWeight: 'bold',
        letterSpacing: '0.2em',
        color: isMythic ? '#fff' : RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS],
        marginBottom: '1rem',
        textTransform: 'uppercase'
      }}>
        {card.rarity}
      </div>

      {/* Image / Icon */}
      <div style={{
        fontSize: '5rem',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.5))'
      }}>
        {card.imageUrl}
      </div>

      {/* Info */}
      <div style={{ width: '100%', textAlign: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{card.name}</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          "{card.description}"
        </p>
      </div>

      {/* Trade/Scrap Action for Duplicates */}
      {quantity > 1 && (
        <button style={{
          marginTop: '1rem',
          padding: '4px 8px',
          background: 'rgba(255,0,0,0.2)',
          border: '1px solid rgba(255,0,0,0.5)',
          color: '#ff6b6b',
          borderRadius: '4px',
          fontSize: '0.7rem',
          cursor: 'pointer'
        }}>
          Parçala (+50 XP)
        </button>
      )}
    </div>
  );
};

const CardInventory: React.FC = () => {
  const [userCards, setUserCards] = useState<UserCard[]>(() => {
    const saved = localStorage.getItem('mythforum_cards');
    if (saved) return JSON.parse(saved);
    return MOCK_USER_INVENTORY;
  });
  const [showDrop, setShowDrop] = useState<CardType | null>(null);

  React.useEffect(() => {
    localStorage.setItem('mythforum_cards', JSON.stringify(userCards));
  }, [userCards]);

  React.useEffect(() => {
    if (!document.getElementById('card-animations')) {
      const style = document.createElement('style');
      style.id = 'card-animations';
      style.innerHTML = `
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleSimulateDrop = () => {
    const randomCard = MOCK_AVAILABLE_CARDS[Math.floor(Math.random() * MOCK_AVAILABLE_CARDS.length)];
    setShowDrop(randomCard);
  };

  const handleCloseDrop = () => {
    if (showDrop) {
      // Add to inventory
      setUserCards(prev => {
        const existing = prev.find(c => c.cardId === showDrop.id);
        if (existing) {
          return prev.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c);
        }
        return [...prev, { id: Date.now().toString(), userId: 'me', cardId: showDrop.id, quantity: 1, acquiredAt: Date.now() }];
      });
    }
    setShowDrop(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Koleksiyon Envanteri</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={handleSimulateDrop}
            className="mythic-card"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            🎁 Test Drop (Kutu Aç)
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Toplam: {userCards.reduce((acc, curr) => acc + curr.quantity, 0)} Kart
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {userCards.map(userCard => {
          const cardDef = MOCK_AVAILABLE_CARDS.find(c => c.id === userCard.cardId);
          if (!cardDef) return null;
          return <CardDisplay key={userCard.id} card={cardDef} quantity={userCard.quantity} />;
        })}
      </div>

      {userCards.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <p>Henüz hiç kart kazanmadınız. Konu açarak ve yorum yaparak kart düşürme şansı yakalayın!</p>
        </div>
      )}

      {showDrop && (
        <DropModal card={showDrop} onClose={handleCloseDrop} />
      )}
    </div>
  );
};

export default CardInventory;
