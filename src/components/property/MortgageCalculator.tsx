'use client';

import { useMemo, useState } from 'react';
import { useApp } from '@/components/Providers';

const Slider = ({ id, label, value, display, min, max, step, onChange }: { id: string; label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void }) => (
  <div>
    <div className="mb-3 flex items-baseline justify-between">
      <label htmlFor={id} className="text-[10px] font-medium uppercase tracking-wide2 text-ivory/45">{label}</label>
      <output htmlFor={id} className="font-serif text-xl text-ivory" dir="ltr">{display}</output>
    </div>
    <input id={id} type="range" className="h-1 w-full cursor-pointer" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

export default function MortgageCalculator({ price = 6900000, fixedPrice = false }: { price?: number; fixedPrice?: boolean }) {
  const { money } = useApp();
  const [value, setValue] = useState(price);
  const [down, setDown] = useState(25);
  const [rate, setRate] = useState(4.25);
  const [years, setYears] = useState(25);

  const r = useMemo(() => {
    const loan = value * (1 - down / 100);
    const i = rate / 100 / 12;
    const n = years * 12;
    const monthly = i === 0 ? loan / n : (loan * i) / (1 - Math.pow(1 + i, -n));
    return { loan, monthly, total: monthly * n, interest: monthly * n - loan };
  }, [value, down, rate, years]);
  const share = r.total > 0 ? (r.loan / r.total) * 100 : 100;

  return (
    <div className="grid gap-px bg-white/[0.07] lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-8 bg-ink-800 p-7 sm:p-10">
        {!fixedPrice && <Slider id="mc-price" label="Property price" value={value} display={money(value)} min={1000000} max={70000000} step={250000} onChange={setValue} />}
        <Slider id="mc-down" label="Down payment" value={down} display={`${down}% · ${money(value * down / 100, true)}`} min={20} max={80} step={5} onChange={setDown} />
        <Slider id="mc-rate" label="Interest rate" value={rate} display={`${rate.toFixed(2)}%`} min={1} max={9} step={0.05} onChange={setRate} />
        <Slider id="mc-years" label="Term" value={years} display={`${years} years`} min={5} max={25} step={1} onChange={setYears} />
      </div>
      <div className="flex flex-col justify-between bg-ink-700 p-7 sm:p-10">
        <div>
          <p className="eyebrow">Estimated monthly payment</p>
          <p className="mt-4 font-serif text-[clamp(2.4rem,5vw,3.6rem)] font-light leading-none text-gold" dir="ltr" aria-live="polite">{money(r.monthly)}</p>
          <div className="mt-8 flex h-1.5 w-full overflow-hidden bg-white/10" role="img" aria-label={`Principal ${share.toFixed(0)}%, interest ${(100 - share).toFixed(0)}%`}>
            <span className="bg-gold transition-all duration-500" style={{ width: `${share}%` }} />
            <span className="bg-ivory/30 transition-all duration-500" style={{ width: `${100 - share}%` }} />
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            {[['Loan amount', r.loan, 'bg-gold'], ['Total interest', r.interest, 'bg-ivory/30'], ['Total repayable', r.total, '']].map(([l, v, c]) => (
              <div key={l as string} className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <dt className="flex items-center gap-2 text-ivory/55">{c && <i className={`h-2 w-2 ${c}`} />}{l}</dt>
                <dd className="text-ivory" dir="ltr">{money(v as number)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-6 text-[11px] leading-relaxed text-ivory/35">Indicative only. Excludes Land Department fees (4%), registration and insurance. Non-resident buyers typically require a 40–50% down payment.</p>
      </div>
    </div>
  );
}
