import { StoryCMS, ArtisanProfile, LookbookItem, StoreLocation, PolicyDocument, FAQItem } from '@/types';

export const INITIAL_STORY: StoryCMS = {
  brandTitle: 'MONARCH — The Sovereign Atelier of Indian Haute Couture',
  heroHeadline: 'A Century of Royal Dignity Woven Into Living Tapestry',
  manifesto: 'Founded on the reverence of ancient Indian textile architecture, MONARCH is not merely a couture house; it is the custodian of pitloom corridors, 24K gold zari alchemy, and timeless sovereign ceremonies.',
  establishedYear: '1924',
  editorialQuote: 'A sari or sherwani crafted with pure gold zari never ages; it merely awaits the next sovereign celebration.',
  quoteAuthor: 'Gayatri Devi of Jaipur',
  bannerImage: '/images/footer-heritage-drift-wide.jpg',
  sections: [
    {
      id: 'sec-s-1',
      heading: 'The Sacred Corridors of Kashi',
      content: 'Along the timeless ghats of Varanasi, where the Ganges breathes mist into wooden loom sheds, our master weavers practice the sacred Kadwa technique without a single floating thread on the reverse.',
      image: '/images/moods/banarasi_brocade.jpg',
    },
    {
      id: 'sec-s-2',
      heading: 'Awadhi Karchob & Zardozi Sanctum',
      content: 'In our private Lucknow ateliers, craftsmen stretch velvet over heavy oak frames, spending months placing bullion cords, freshwater seed pearls, and dipped gold sequins with surgical precision.',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
    },
  ],
};

export const INITIAL_ARTISANS: ArtisanProfile[] = [
  {
    id: 'art-1',
    name: 'Ustad Rehmat Ali',
    craft: 'Master Zardozi & Karchob Artisan',
    region: 'Awadh, Lucknow',
    experienceYears: 46,
    biography: 'Fifth-generation karigar whose ancestors embroidered robes for the Nawabs of Awadh. Renowned for three-dimensional raised floral dabka.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=70&w=600&auto=format&fit=crop',
    signaturePieces: ['Gulnaar Bridal Lehenga', 'Sheesh Mahal Sherwani'],
  },
  {
    id: 'art-2',
    name: 'Pandit Somnath Mukherjee',
    craft: 'Sacred Kashi Kadwa Handloom Master',
    region: 'Varanasi, Uttar Pradesh',
    experienceYears: 42,
    biography: 'National Handicraft Award recipient. Specializes in 24K tested real gold zari pitloom weaving without reverse floaters.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=70&w=600&auto=format&fit=crop',
    signaturePieces: ['Varanasi Kashi Kadwa Brocade Saree'],
  },
  {
    id: 'art-3',
    name: 'K. Parthasarathy',
    craft: 'Authentic Korvai Pitloom Weaver',
    region: 'Kanchipuram, Tamil Nadu',
    experienceYears: 38,
    biography: 'Master of three-shuttle interlocking temple border weaves on ancestral wooden pitlooms.',
    image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=70&w=600&auto=format&fit=crop',
    signaturePieces: ['Surya Rekha Kanjivaram Gold Tissue Saree'],
  },
  {
    id: 'art-4',
    name: 'Bashir Ahmad Mir',
    craft: 'Kashmiri Gold Tilla Needlecraft',
    region: 'Srinagar, Kashmir',
    experienceYears: 34,
    biography: 'Preserving the intricate paisley and chinar leaf needlepoint using silver-gilt and antique gold wires.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=70&w=600&auto=format&fit=crop',
    signaturePieces: ['Zohra Chanderi Zari Tissue Kurta Set'],
  },
];

export const INITIAL_STORES: StoreLocation[] = [
  {
    id: 'store-1',
    name: 'MONARCH Flagship Atelier & Boutique',
    city: 'Mumbai',
    address: '18/22 Ropewalk Lane, Behind Rhythm House, Kala Ghoda, Fort',
    phone: '+91 22 6984 4000',
    email: 'mumbai.atelier@monarch-couture.in',
    workingHours: 'Mon - Sun: 11:00 AM – 8:00 PM',
    image: '/images/panoramic/ensemble_utsav.jpg',
    valetService: true,
    appointmentOnly: false,
  },
  {
    id: 'store-2',
    name: 'MONARCH Royal Manor & Bridal Gallery',
    city: 'New Delhi',
    address: 'The One Style Mile, Kalka Das Marg, Mehrauli',
    phone: '+91 11 4120 7700',
    email: 'delhi.sanctum@monarch-couture.in',
    workingHours: 'Tue - Sun: 11:30 AM – 8:30 PM (Closed Mondays)',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
    valetService: true,
    appointmentOnly: false,
  },
  {
    id: 'store-3',
    name: 'MONARCH Heritage Haveli Boutique',
    city: 'Jaipur',
    address: 'Plot 4, Jacob Road, Civil Lines',
    phone: '+91 141 222 9840',
    email: 'jaipur.haveli@monarch-couture.in',
    workingHours: 'Mon - Sat: 10:30 AM – 7:30 PM',
    image: '/images/footer-banner-lake-palace.jpg',
    valetService: true,
    appointmentOnly: false,
  },
  {
    id: 'store-4',
    name: 'MONARCH Flagship Boutique & Trousseau Room',
    city: 'Bengaluru',
    address: 'Level 2, The Collection, UB City, Vittal Mallya Road',
    phone: '+91 80 4099 5522',
    email: 'bengaluru.lounge@monarch-couture.in',
    workingHours: 'Mon - Sun: 11:00 AM – 9:00 PM',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=800&auto=format&fit=crop',
    valetService: true,
    appointmentOnly: false,
  },
];

export const INITIAL_LOOKBOOKS: LookbookItem[] = [
  {
    id: 'look-1',
    title: 'Awadhi Darbar: Autumn-Winter 2026',
    season: 'Autumn-Winter',
    collection: 'Bridal & Royal Groom',
    coverImage: '/images/panoramic/ensemble_utsav.jpg',
    images: [
      '/images/panoramic/ensemble_utsav.jpg',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=70&w=800&auto=format&fit=crop',
    ],
    displayOrder: 1,
    photographer: 'Tarun Vishwa',
    stylist: 'Anaita Shroff Adajania',
  },
  {
    id: 'look-2',
    title: 'Echoes of Kashi: The Heritage Silk Symphony',
    season: 'Festive 2026',
    collection: 'Six Moods of Silk',
    coverImage: '/images/moods/banarasi_brocade.jpg',
    images: [
      '/images/moods/banarasi_brocade.jpg',
      '/images/moods/kanjivaram_silk.jpg',
      '/images/moods/paithani_heirloom.jpg',
    ],
    displayOrder: 2,
    photographer: 'Bharat Sikka',
    stylist: 'Rhea Kapoor',
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Bespoke & Tailoring',
    question: 'How does the MONARCH Bespoke Tailoring process work?',
    answer: 'Once you select a bespoke garment, our Private Concierge schedules a video or in-person measurement consultation. A master tailor crafts a toile (muslin draft) before hand-cutting the pure silk or velvet fabric.',
    displayOrder: 1,
  },
  {
    id: 'faq-2',
    category: 'Authenticity & Hallmarks',
    question: 'How do you guarantee the purity of 24K gold zari in handlooms?',
    answer: 'Every pure zari saree or lehenga comes accompanied by a government-approved lab certificate and Silk Mark authentication validating the gold and silver purity percentage in the weft.',
    displayOrder: 2,
  },
  {
    id: 'faq-3',
    category: 'White-Glove Shipping',
    question: 'How are high-value bridal ensembles shipped to international destinations?',
    answer: 'All high-value commissions are shipped in climate-sealed, temperature-controlled, fully insured air transit with real-time GPS tracking and dedicated white-glove customs clearance.',
    displayOrder: 3,
  },
  {
    id: 'faq-4',
    category: 'Care & Preservation',
    question: 'How should handwoven Banarasi and Kanjivaram sarees be preserved?',
    answer: 'Store only in unbleached pure cotton or muslin covers. Never use plastic covers. Fold along new crease lines every four months and air dry in shade once a year.',
    displayOrder: 4,
  },
];

export const INITIAL_POLICIES: PolicyDocument[] = [
  {
    id: 'pol-shipping',
    key: 'shipping',
    title: 'Sovereign White-Glove Shipping & Delivery Protocol',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: 'Complimentary Pan-India Delivery',
        content: 'All orders above ₹ 50,000 are delivered complimentary via insured express air couriers (BlueDart Apex / Delhivery Luxury).',
      },
      {
        title: 'Dispatch Timelines',
        content: 'Ready-to-ship heritage sarees and jackets dispatch within 48 hours. Bespoke bridal lehengas and tailored sherwanis require 4 to 8 weeks handcrafting time.',
      },
    ],
  },
  {
    id: 'pol-returns',
    key: 'returns',
    title: 'Returns, Alterations & Heritage Exchange Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: 'Complimentary Fitting Alterations',
        content: 'MONARCH offers unlimited complimentary lifetime alterations on bespoke garments across our flagship boutiques in Mumbai, Delhi, Jaipur, and Bengaluru.',
      },
      {
        title: '7-Day Heritage Return Guarantee',
        content: 'Unworn ready-to-wear sarees and kurtas may be returned within 7 calendar days of receipt in original packaging with untampered gold security seals.',
      },
    ],
  },
  {
    id: 'pol-privacy',
    key: 'privacy',
    title: 'Private Client Confidentiality & Data Privacy',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: 'Non-Disclosure of Sovereign Patronage',
        content: 'We adhere to the highest confidentiality standards. Bridal commissions and private client measurements are never published or shared without explicit written consent.',
      },
    ],
  },
  {
    id: 'pol-terms',
    key: 'terms',
    title: 'Terms of Haute Couture Service',
    lastUpdated: 'October 2026',
    sections: [
      {
        title: 'Handcrafted Irregularity Grace',
        content: 'As every weave is woven on pitlooms without electric assistance, minor variations in zari motifs or slub texture are the hallmark of authentic handloom heritage.',
      },
    ],
  },
];
