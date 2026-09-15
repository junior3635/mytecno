import Image from 'next/image';

export default function ArticleImage({
  src,
  alt,
  ratio = '16 / 9',
  eager = false,
  sizes = '(max-width: 700px) 100vw, 560px',
}: {
  src: string | null;
  alt: string;
  ratio?: string;
  eager?: boolean;
  sizes?: string;
}) {
  if (!src) {
    const initial = alt.trim().charAt(0).toUpperCase() || 'M';
    return (
      <div
        className="article-image-fallback"
        style={{ aspectRatio: ratio }}
        role="img"
        aria-label={alt}
        data-initial={initial}
      />
    );
  }
  return (
    <div className="article-image-wrap" style={{ aspectRatio: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={eager}
        className="article-image-el"
      />
    </div>
  );
}