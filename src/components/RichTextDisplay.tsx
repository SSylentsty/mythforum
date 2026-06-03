import React from 'react';

interface RichTextDisplayProps {
  content: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content }) => {
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi;
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/;
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g;

  const renderTextWithMentions = (text: string) => {
    return text.split(mentionRegex).map((chunk, i) => {
      if (chunk.match(mentionRegex)) {
        return <span key={i} style={{ color: 'var(--accent)', fontWeight: 'bold', backgroundColor: 'rgba(241, 196, 15, 0.1)', padding: '2px 4px', borderRadius: '4px' }}>{chunk}</span>;
      }
      return chunk;
    });
  };

  const renderContent = () => {
    const parts = content.split('\n');
    return parts.map((part, index) => {
      // Empty line
      if (part.trim() === '') return <br key={index} />;

      // Blockquote
      if (part.trim().startsWith('>')) {
        return (
          <blockquote key={index} style={{
            borderLeft: '4px solid var(--accent)',
            margin: '1rem 0',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            fontStyle: 'italic',
            color: 'var(--text-secondary)'
          }}>
            {renderTextWithMentions(part.substring(1).trim())}
          </blockquote>
        );
      }

      // Check for image URL
      const imageMatch = part.match(imageRegex);
      if (imageMatch) {
        return <img key={index} src={imageMatch[0]} alt="Mythic Artifact" style={{ maxWidth: '100%', borderRadius: '4px', margin: '1rem 0', display: 'block' }} />;
      }

      // Check for YouTube URL
      const youtubeMatch = part.match(youtubeRegex);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        return (
          <div key={index} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', margin: '1rem 0' }}>
            <iframe
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      return <p key={index} style={{ marginBottom: '1rem', wordBreak: 'break-word' }}>{renderTextWithMentions(part)}</p>;
    });
  };

  return <div className="rich-text-content">{renderContent()}</div>;
};

export default RichTextDisplay;
