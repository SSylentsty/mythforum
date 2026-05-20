export interface LevelConfig {
  level: number;
  minXp: number;
  tag: string;
  color: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, minXp: 0, tag: 'Mortal', color: '#95a5a6' },
  { level: 2, minXp: 100, tag: 'Hero', color: '#3498db' },
  { level: 3, minXp: 300, tag: 'Demi-God', color: '#9b59b6' },
  { level: 4, minXp: 600, tag: 'Olympian', color: '#f1c40f' },
  { level: 5, minXp: 1000, tag: 'Titan', color: '#e67e22' },
  { level: 6, minXp: 2000, tag: 'Ancient One', color: '#e74c3c' },
];

export const getLevelInfo = (xp: number): LevelConfig => {
  const reversedLevels = [...LEVELS].reverse();
  const currentLevel = reversedLevels.find(l => xp >= l.minXp) || LEVELS[0];
  return currentLevel;
};

export const XP_REWARDS = {
  CREATE_THREAD: 50,
  ADD_COMMENT: 30,
};
