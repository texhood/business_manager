/**
 * Video Block Component
 * Embedded video (YouTube, Vimeo, or direct URL)
 */

import React from 'react';
import './blocks.css';

const VideoBlock = ({ content, settings }) => {
  const {
    url = '',
    title = '',
    caption = '',
    aspectRatio = '16:9', // '16:9', '4:3', '1:1'
    autoplay = false,
    muted = false
  } = content;

  const { backgroundColor = '', padding = 'large' } = settings;

  const sectionStyle = {
    backgroundColor: backgroundColor || undefined
  };

  // Parse video URL to get embed URL
  const getEmbedUrl = () => {
    if (!url) return null;

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('mute', '1');
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?${params.toString()}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (muted) params.set('muted', '1');
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?${params.toString()}`;
    }

    // Direct video URL
    return url;
  };

  const embedUrl = getEmbedUrl();
  const isDirectVideo = embedUrl && (embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm') || embedUrl.endsWith('.ogg'));

  const aspectClass = `aspect-${aspectRatio.replace(':', '-')}`;

  return (
    <section className={`block block-video padding-${padding}`} style={sectionStyle}>
      <div className="container">
        {title && <h2 className="block-title text-center">{title}</h2>}
        
        <div className={`video-wrapper ${aspectClass}`}>
          {isDirectVideo ? (
            <video 
              src={embedUrl} 
              controls 
              autoPlay={autoplay} 
              muted={muted}
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={title || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="video-placeholder">
              <p>Video URL not configured</p>
            </div>
          )}
        </div>
        
        {caption && <p className="video-caption text-center">{caption}</p>}
      </div>
    </section>
  );
};

export default VideoBlock;
