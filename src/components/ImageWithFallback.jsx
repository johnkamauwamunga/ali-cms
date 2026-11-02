import { useState } from 'react';

export function ImageWithFallback({ src, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=70' : src}
      alt={alt || ''}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
