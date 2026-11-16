export const whatsappLink = (number: string, text: string) => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
