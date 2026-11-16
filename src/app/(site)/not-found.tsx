import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-serif text-[9rem] font-light leading-none text-gold/30">404</p>
      <h1 className="mt-2 font-serif text-4xl font-light">This address does not exist</h1>
      <p className="lede mt-4">The page may have moved, or the residence may no longer be listed.</p>
      <Link href="/properties" className="btn-gold mt-10">Browse residences</Link>
    </div>
  );
}
