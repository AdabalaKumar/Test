/**
 * Google Maps embed. With NEXT_PUBLIC_GOOGLE_MAPS_KEY set it uses the Maps Embed API;
 * without a key it falls back to the keyless embed so the map still works out of the box.
 */
export default function MapEmbed({ lat, lng, label, zoom = 14, className = '' }: { lat: number; lng: number; label: string; zoom?: number; className?: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${lat},${lng}&zoom=${zoom}`
    : `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  return (
    <div className={`relative overflow-hidden border border-white/[0.07] ${className}`}>
      <iframe title={`Map — ${label}`} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
        className="h-full min-h-[360px] w-full [filter:grayscale(1)_invert(.92)_contrast(.9)_hue-rotate(180deg)_brightness(.95)]" />
      <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="glass absolute bottom-4 left-4 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide2 text-ivory hover:text-gold">
        Open in Google Maps ↗
      </a>
    </div>
  );
}
