/**
 * Single source of truth for brand + contact details.
 * Change it here and it updates the navbar, footer, contact page, policies,
 * order emails and the customer invoice.
 */
export const SITE = {
  name: 'HOTBEE',
  tagline: 'Luxury Print POD',
  supportPhoneDisplay: '+91 77951 83353',
  supportPhoneRaw: '917795183353',
  supportPhoneLocal: '7795183353',
  supportEmail: 'hotbee@gmail.com',
  whatsappUrl: 'https://wa.me/917795183353',
  supportHours: 'Mon - Sat, 10 AM to 7 PM IST',
  addressLines: ['HOTBEE Commerce Platform', 'Indiranagar, Bengaluru, Karnataka 560038'],
  instagramUrl: 'https://instagram.com',
  freeShippingThreshold: 999,
  shippingFee: 79,
} as const;

export const telHref = `tel:+${SITE.supportPhoneRaw}`;
export const mailHref = `mailto:${SITE.supportEmail}`;
