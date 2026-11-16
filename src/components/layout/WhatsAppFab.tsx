'use client';

import { useApp } from '@/components/Providers';
import { whatsappLink } from '@/lib/whatsapp';


export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.98 2.9 9.82 9.82 0 0 1 2.9 6.99c-.01 5.45-4.45 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L0 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.9-11.9a11.82 11.82 0 0 0-3.48-8.41z" />
    </svg>
  );
}

export default function WhatsAppFab({ number }: { number: string }) {
  const { t } = useApp();
  return (
    <a
      href={whatsappLink(number, 'Hello Aurelia Estates, I would like to know more about your residences.')} target="_blank" rel="noopener noreferrer" aria-label={t('cta.whatsapp')}
      className="group fixed bottom-[4.75rem] right-4 z-30 flex lg:bottom-5 lg:right-5 items-center gap-0 rounded-full border border-white/10 bg-[#1f8f5f] p-3.5 text-white shadow-2xl shadow-black/50 transition-all duration-500 ease-luxe hover:gap-3 hover:pr-5 rtl:left-5 rtl:right-auto"
    >
      <WhatsAppIcon size={22} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide2 transition-all duration-500 ease-luxe group-hover:max-w-[12rem]">{t('cta.whatsapp')}</span>
    </a>
  );
}
