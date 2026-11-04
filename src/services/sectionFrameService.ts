import { SectionFrame } from '@/types';
import { getFromStorage, saveToStorage } from './storageHelper';
import { apiClient } from './apiClient';
import { INITIAL_SECTION_FRAMES } from '@/data/sectionFrames';

export const SECTION_OPTIONS = [
  { key: 'six-moods', name: '1. Six Moods of Silk', count: 6 },
  { key: 'woven-remembered', name: '2. Woven to Be Remembered', count: 6 },
  { key: 'new-arrivals', name: '3. New Arrivals', count: 4 },
  { key: 'best-sellers', name: '4. Best Sellers', count: 4 },
  { key: 'bridal', name: '5. The Bridal Collection', count: 3 },
  { key: 'trend-of-day', name: '6. Trend of the Day', count: 2 },
  { key: 'seasonal-special', name: '7. Seasonal Special', count: 2 },
  { key: 'autumn-winter', name: '8. Autumn-Winter 2026 Forecast', count: 3 },
  { key: 'change-your-look', name: '9. Change Your Look Studio', count: 3 },
  { key: 'edits-occasion', name: '10. Edits for Every Occasion', count: 4 },
  { key: 'worth-attention', name: '11. Worth Your Attention Spotlight', count: 3 },
  { key: 'cinematic-stories', name: '12. Moments in Silk (Cinematic Stories)', count: 3 },
  { key: 'latest-trends', name: '13. Latest Trends Deck', count: 3 },
  { key: 'atelier-sanctum', name: '14. Royal Craft Sanctum & Atelier', count: 4 },
];

const STORAGE_KEY = 'section_frames';
let hasSyncedFrames = false;

export const sectionFrameService = {
  getFrames(sectionKey?: string): SectionFrame[] {
    let cached = getFromStorage<SectionFrame[]>(STORAGE_KEY, []);
    if (!cached || cached.length === 0) {
      cached = INITIAL_SECTION_FRAMES;
      if (typeof window !== 'undefined') {
        saveToStorage(STORAGE_KEY, INITIAL_SECTION_FRAMES);
      }
    }

    if (typeof window !== 'undefined' && !hasSyncedFrames) {
      hasSyncedFrames = true;
      this.syncWithBackend().catch(() => {});
    }

    if (sectionKey && sectionKey !== 'all') {
      return (cached || [])
        .filter((f) => f.sectionKey === sectionKey)
        .sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return [...(cached || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  },

  async fetchFrames(sectionKey?: string): Promise<SectionFrame[]> {
    return this.syncWithBackend(sectionKey);
  },

  async syncWithBackend(sectionKey?: string): Promise<SectionFrame[]> {
    try {
      const remote = await apiClient.frames.getAll(sectionKey);
      if (remote && Array.isArray(remote)) {
        saveToStorage(STORAGE_KEY, remote);
        return sectionKey && sectionKey !== 'all'
          ? remote.filter((f) => f.sectionKey === sectionKey)
          : remote;
      }
    } catch (err) {
      console.warn('Could not sync section frames with backend:', err);
    }
    return this.getFrames(sectionKey);
  },

  getFrameById(id: string): SectionFrame | undefined {
    return this.getFrames().find((f) => f.id === id || (f as any)._id === id);
  },

  createFrame(newFrame: Omit<SectionFrame, 'id'>): SectionFrame {
    const frames = this.getFrames();
    const id = `frm-${newFrame.sectionKey}-${Date.now()}`;
    const frame: SectionFrame = {
      ...newFrame,
      id,
      displayOrder: newFrame.displayOrder || frames.filter((f) => f.sectionKey === newFrame.sectionKey).length + 1,
      isVisible: newFrame.isVisible !== undefined ? newFrame.isVisible : true,
    };
    const updated = [...frames, frame];
    saveToStorage(STORAGE_KEY, updated);

    apiClient.frames.create(frame).catch((err) => {
      console.warn('Backend sync error on createFrame:', err);
    });

    return frame;
  },

  updateFrame(id: string, updates: Partial<SectionFrame>): SectionFrame {
    const frames = this.getFrames();
    const index = frames.findIndex((f) => f.id === id || (f as any)._id === id);
    if (index === -1) throw new Error('Frame not found');

    const updated = { ...frames[index], ...updates };
    frames[index] = updated;
    saveToStorage(STORAGE_KEY, frames);

    apiClient.frames.update(id, updates).catch((err) => {
      console.warn('Backend sync error on updateFrame:', err);
    });

    return updated;
  },

  deleteFrame(id: string): void {
    const frames = this.getFrames();
    const filtered = frames.filter((f) => f.id !== id && (f as any)._id !== id);
    saveToStorage(STORAGE_KEY, filtered);

    apiClient.frames.delete(id).catch((err) => {
      console.warn('Backend sync error on deleteFrame:', err);
    });
  },

  toggleVisibility(id: string): SectionFrame {
    const frames = this.getFrames();
    const index = frames.findIndex((f) => f.id === id || (f as any)._id === id);
    if (index === -1) throw new Error('Frame not found');

    const updated = { ...frames[index], isVisible: !frames[index].isVisible };
    frames[index] = updated;
    saveToStorage(STORAGE_KEY, frames);

    apiClient.frames.update(id, { isVisible: updated.isVisible }).catch((err) => {
      console.warn('Backend sync error on toggleVisibility:', err);
    });

    return updated;
  },

  reorderFrames(sectionKey: string, orderedIds: string[]): SectionFrame[] {
    const allFrames = this.getFrames();
    const updated = allFrames.map((f) => {
      if (f.sectionKey === sectionKey) {
        const orderIdx = orderedIds.indexOf(f.id);
        if (orderIdx !== -1) {
          return { ...f, displayOrder: orderIdx + 1 };
        }
      }
      return f;
    });
    saveToStorage(STORAGE_KEY, updated);

    apiClient.frames.reorder(sectionKey, orderedIds).catch((err) => {
      console.warn('Backend sync error on reorderFrames:', err);
    });

    return updated.filter((f) => f.sectionKey === sectionKey).sort((a, b) => a.displayOrder - b.displayOrder);
  },

  resetToDefault(): SectionFrame[] {
    saveToStorage(STORAGE_KEY, []);
    return [];
  },
};
