import React from 'react';

interface RichTextDisplayProps {
  content: string;
}

const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content }) => {
  // Regex to detect YouTube/Vimeo/Image URLs
  const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi;

  const renderContent = () => {
    const parts = content.split('\n');
    return parts.map((part, index) => {
      // Check for image URL
      const imageMatch = part.match(imageRegex);
      if (imageMatch) {
        return <img key={index} src={imageMatch[0]} alt="Mythic Artifact" style={{ maxWidth: '100%', borderRadius: '4px', margin: '1rem 0', display: 'block' }} />;
      }

      // Check for YouTube URL
      const youtubeMatch = part.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/);
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

      return <p key={index} style={{ marginBottom: '1rem' }}>{part}</p>;
    });
  };

  return <div className="rich-text-content">{renderContent()}</div>;
};

export default RichTextDisplay;
