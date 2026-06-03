// A simple profanity filter for demonstration.
// In a real production app, this would be much more extensive or use an external API.
import { auth } from '../firebase/config';

const BAD_WORDS = [
  'küfür1',
  'küfür2',
  'aptal',
  'salak',
  'gerizekalı',
  'şerefsiz',
  'pislik',
  'lan',
  'amk',
  'aq',
  'oç',
  // Add more bad words as needed
];

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');

  const words = normalizedText.split(' ');

  for (const word of words) {
    if (BAD_WORDS.includes(word)) {
      return true;
    }
  }

  return false;
};

export const handleProfanityViolation = async () => {
  if (!auth.currentUser) return;
  try {
    const token = await auth.currentUser.getIdToken();
    const userId = auth.currentUser.uid;
    
    await fetch('/api/moderation/ban', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, reason: 'Profanity detected' })
    });
    
    alert('Hesabınız platform kurallarına aykırı (uygunsuz/küfürlü) içerik paylaşımı sebebiyle engellenmiştir.');
    await auth.signOut();
    window.location.href = '/';
  } catch (err) {
    console.error('Failed to process violation:', err);
  }
};
