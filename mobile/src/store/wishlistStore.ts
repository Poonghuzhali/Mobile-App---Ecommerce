import { create } from 'zustand';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

type WishlistState = {
  productIds: number[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  isWished: (productId: number) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  loading: false,
  fetchWishlist: async () => {
    if (!useAuthStore.getState().accessToken) {
      set({ productIds: [] });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await api.get<{ product_id: number }[]>('/auth/wishlist/');
      set({ productIds: data.map((item) => item.product_id) });
    } finally {
      set({ loading: false });
    }
  },
  toggleWishlist: async (productId) => {
    const ids = get().productIds;
    const wished = ids.includes(productId);
    if (wished) {
      await api.delete('/auth/wishlist/', { data: { product_id: productId } });
      set({ productIds: ids.filter((id) => id !== productId) });
    } else {
      await api.post('/auth/wishlist/', { product_id: productId });
      set({ productIds: [...ids, productId] });
    }
  },
  isWished: (productId) => get().productIds.includes(productId),
  clearWishlist: () => set({ productIds: [] }),
}));
