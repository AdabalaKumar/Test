import Image from 'next/image';
import Reveal from './Reveal';

/** Shared inner-page masthead: optional full-bleed image, eyebrow, serif title and lede. */
export default function PageHeader({ eyebrow, title, lede, image, children }: { eyebrow: string; title: string; lede?: string; image?: string; children?: React.ReactNode }) {
  return (
    <header className={`grain relative overflow-hidden ${image ? 'min-h-[68svh]' : ''} flex items-end border-b border-white/[0.07]`}>
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/50" />
        </>
      )}
      {!image && <div className="absolute inset-0 bg-[radial-gradient(50%_90%_at_80%_0%,rgba(201,169,110,.13),transparent)]" />}
      <div className={`shell relative pb-12 lg:pb-16 ${image ? 'pt-40 lg:pt-52' : 'pt-32 lg:pt-40'}`}>
        <Reveal>
          <p className="eyebrow flex items-center gap-4"><span className="h-px w-10 bg-gold" />{eyebrow}</p>
          <h1 className="display mt-6 max-w-5xl !text-[clamp(2.6rem,6vw,5.4rem)]">{title}</h1>
          {lede && <p className="lede mt-7 max-w-2xl">{lede}</p>}
          {children}
        </Reveal>
      </div>
    </header>
  );
}
