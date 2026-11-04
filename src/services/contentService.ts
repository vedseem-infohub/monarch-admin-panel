import {
  StoryCMS,
  ArtisanProfile,
  StoreLocation,
  LookbookItem,
  FAQItem,
  PolicyDocument,
  ReturnsExchangePolicy,
} from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { INITIAL_FAQS, INITIAL_POLICIES } from '@/data/content';
import { apiClient } from './apiClient';

const DEFAULT_STORY: StoryCMS = {
  brandTitle: 'MONARCH — The Sovereign Atelier of Indian Haute Couture',
  heroHeadline: 'A Century of Royal Dignity Woven Into Living Tapestry',
  manifesto:
    'Founded on the reverence of ancient Indian textile architecture, MONARCH is not merely a couture house; it is the custodian of pitloom corridors, 24K gold zari alchemy, and timeless sovereign ceremonies.',
  establishedYear: '1924',
  editorialQuote:
    'A sari or sherwani crafted with pure gold zari never ages; it merely awaits the next sovereign celebration.',
  quoteAuthor: 'Gayatri Devi of Jaipur',
  bannerImage: '/images/footer-heritage-drift-wide.jpg',
  sections: [
    {
      id: 'sec-s-1',
      heading: 'The Sacred Corridors of Kashi',
      content:
        'Along the timeless ghats of Varanasi, where the Ganges breathes mist into wooden loom sheds, our master weavers practice the sacred Kadwa technique without a single floating thread on the reverse.',
      image: '/images/moods/banarasi_brocade.jpg',
    },
    {
      id: 'sec-s-2',
      heading: 'Awadhi Karchob & Zardozi Sanctum',
      content:
        'In our private Lucknow ateliers, craftsmen stretch velvet over heavy oak frames, spending months placing bullion cords, freshwater seed pearls, and dipped gold sequins with surgical precision.',
      image:
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=70&w=800&auto=format&fit=crop',
    },
  ],
};

const DEFAULT_RETURNS_POLICY: ReturnsExchangePolicy = {
  title: 'Returns & Exchanges',
  subtitle: 'Seamless exchange assistance handled by your personal concierge.',
  exchangeWindowDays: 7,
  exchangeWindowDescription:
    'Non-customized sarees, unstitched suit materials, and prêt wear can be exchanged within 7 days of delivery, provided original tags, hallmark silk seals, and luxury boxes remain untampered.',
  bespokePolicyHeadline: 'Bespoke Bridal Couture Policy',
  bespokePolicyDescription:
    'Due to individual handcrafting and custom sizing, bespoke bridal lehengas and tailored sherwanis are non-refundable. However, we offer complimentary atelier alterations until the fit is impeccable.',
  exchangeStepsHeadline: 'How to Request an Exchange',
  exchangeStepsDescription:
    'Connect with our Royal Concierge via WhatsApp at +91 98765 43210 or write to concierge@drift-silks.com. We arrange white-glove doorstep reverse pickup.',
  conciergeWhatsApp: '+91 98765 43210',
  conciergeEmail: 'concierge@drift-silks.com',
  lastUpdated: 'November 2026',
  sections: [
    {
      title: 'Complimentary Master Tailoring Alterations',
      content:
        'MONARCH provides complimentary fitting adjustments across all handwoven ensembles at our flagship ateliers in Mumbai, New Delhi, Jaipur, and Bengaluru.',
    },
    {
      title: 'Tamper-Proof Seal Guarantee',
      content:
        'Each saree and lehenga is encased with a serialized 24K gold foil security seal. Exchanges can be processed only if the security seal remains untampered.',
    },
  ],
};

export const contentService = {
  // Story
  getStory(): StoryCMS {
    return getFromStorage<StoryCMS>('cms_story', DEFAULT_STORY);
  },
  updateStory(story: StoryCMS): StoryCMS {
    saveToStorage('cms_story', story);
    return story;
  },

  // Artisans
  getArtisans(): ArtisanProfile[] {
    return getFromStorage<ArtisanProfile[]>('cms_artisans', []);
  },
  updateArtisan(id: string, updates: Partial<ArtisanProfile>): ArtisanProfile {
    const list = this.getArtisans();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Artisan not found');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveToStorage('cms_artisans', list);
    return updated;
  },
  addArtisan(artisan: Omit<ArtisanProfile, 'id'>): ArtisanProfile {
    const list = this.getArtisans();
    const created = { ...artisan, id: `art-${Date.now()}` };
    saveToStorage('cms_artisans', [...list, created]);
    return created;
  },

  // Stores
  getStores(): StoreLocation[] {
    return getFromStorage<StoreLocation[]>('cms_stores', []);
  },
  updateStore(id: string, updates: Partial<StoreLocation>): StoreLocation {
    const list = this.getStores();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Store not found');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveToStorage('cms_stores', list);
    return updated;
  },

  // Lookbooks
  getLookbooks(): LookbookItem[] {
    return getFromStorage<LookbookItem[]>('cms_lookbooks', []);
  },
  updateLookbook(id: string, updates: Partial<LookbookItem>): LookbookItem {
    const list = this.getLookbooks();
    const index = list.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lookbook not found');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveToStorage('cms_lookbooks', list);
    return updated;
  },

  // FAQs
  getFAQs(): FAQItem[] {
    return getFromStorage<FAQItem[]>('cms_faqs', INITIAL_FAQS);
  },

  async fetchFAQs(): Promise<FAQItem[]> {
    try {
      const settings: any = await apiClient.settings.getStoreSettings();
      if (settings?.faqs && Array.isArray(settings.faqs) && settings.faqs.length > 0) {
        saveToStorage('cms_faqs', settings.faqs);
        return settings.faqs;
      }
    } catch {
      // ignore
    }
    return this.getFAQs();
  },

  saveAllFAQs(faqs: FAQItem[]): void {
    saveToStorage('cms_faqs', faqs);
    apiClient.settings.updateStoreSettings({ faqs } as any).catch(() => {});
  },

  updateFAQ(id: string, updates: Partial<FAQItem>): FAQItem {
    const list = this.getFAQs();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('FAQ not found');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    this.saveAllFAQs(list);
    return updated;
  },

  addFAQ(faq: Omit<FAQItem, 'id'>): FAQItem {
    const list = this.getFAQs();
    const created = { ...faq, id: `faq-${Date.now()}` };
    const newList = [...list, created];
    this.saveAllFAQs(newList);
    return created;
  },

  deleteFAQ(id: string): void {
    const list = this.getFAQs();
    const newList = list.filter((f) => f.id !== id);
    this.saveAllFAQs(newList);
  },

  // Returns & Exchanges Policy
  getReturnsPolicy(): ReturnsExchangePolicy {
    return getFromStorage<ReturnsExchangePolicy>('cms_returns_policy', DEFAULT_RETURNS_POLICY);
  },

  async fetchReturnsPolicy(): Promise<ReturnsExchangePolicy> {
    try {
      const settings: any = await apiClient.settings.getStoreSettings();
      if (settings?.returnsPolicy && settings.returnsPolicy.title) {
        saveToStorage('cms_returns_policy', settings.returnsPolicy);
        return settings.returnsPolicy;
      }
    } catch {
      // ignore
    }
    return this.getReturnsPolicy();
  },

  saveReturnsPolicy(policy: ReturnsExchangePolicy): void {
    saveToStorage('cms_returns_policy', policy);
    apiClient.settings.updateStoreSettings({ returnsPolicy: policy } as any).catch(() => {});
  },

  // Policies (Generic)
  getPolicies(): PolicyDocument[] {
    return getFromStorage<PolicyDocument[]>('cms_policies', INITIAL_POLICIES);
  },
  updatePolicy(id: string, updates: Partial<PolicyDocument>): PolicyDocument {
    const list = this.getPolicies();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Policy not found');
    const updated = { ...list[index], ...updates };
    list[index] = updated;
    saveToStorage('cms_policies', list);
    return updated;
  },
};
