export interface AttachmentItem {
  id: string;
  name: string;
  type: 'code' | 'doc' | 'image' | 'data';
  size: string;
}

export const EMOJI_CATEGORIES = [
  {
    title: 'Popular',
    emojis: ['👍', '🔥', '🚀', '💡', '✨', '🎯', '❤️', '👏', '🎉', '🧠'],
  },
  {
    title: 'Smiles & Gestures',
    emojis: ['😀', '😄', '😊', '😎', '🤔', '🙌', '🤝', '💪', '👀', '✌️'],
  },
  {
    title: 'Work & Productivity',
    emojis: ['💻', '📊', '📈', '📋', '📁', '📦', '⏳', '📌', '📎', '🔒'],
  },
  {
    title: 'Symbols & Badges',
    emojis: ['✅', '⚡', '⭐', '🌟', '💎', '🟢', '🔵', '🔴', '🟡', '⚠️'],
  },
];

export const QUICK_REACTION_EMOJIS = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '😮', '🙏', '💯', '😍', '🤣', '😭', '🤯', '⚡', '🚀'];
