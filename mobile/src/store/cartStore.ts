import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api } from '../api/client';
import type { Cart } from '../api/types';
import { useAuthStore } from './authStore';

type CartState = {
  cart: Cart | null;
  loading: boolean;
  isHydrated: boolean;
  setCart: (cart: Cart | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  setHydrated: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      isHydrated: false,
      setCart: (cart) => set({ cart }),
      setHydrated: () => set({ isHydrated: true }),
      fetchCart: async () => {
        if (!useAuthStore.getState().accessToken) return;
        set({ loading: true });
        try {
          const { data } = await api.get<Cart>('/orders/cart/');
          set({ cart: data });
        } finally {
          set({ loading: false });
        }
      },
      addItem: async (productId, quantity = 1) => {
        if (useAuthStore.getState().accessToken) {
          const { data } = await api.post<Cart>('/orders/cart/', { product_id: productId, quantity });
          set({ cart: data });
        }
      },
      updateQuantity: async (productId, quantity) => {
        if (!useAuthStore.getState().accessToken) return;
        const { data } = await api.patch<Cart>('/orders/cart/', { product_id: productId, quantity });
        set({ cart: data });
      },
      removeItem: async (productId) => {
        if (!useAuthStore.getState().accessToken) return;
        const res = await api.delete<Cart>('/orders/cart/', { data: { product_id: productId } });
        set({ cart: res.data });
      },
    }),
    {
      name: 'luxecart-cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ cart: s.cart }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export const cartItemCount = (cart: Cart | null) => cart?.item_count ?? 0;
