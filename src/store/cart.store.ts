import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  slug: string;
}

interface AddCartItemPayload {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  slug: string;
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  addItem: (product: AddCartItemPayload) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

const createCartSnapshot = (items: CartItem[]) => ({
  items,
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
});

const normalizeQuantity = (quantity: number | undefined) => {
  if (!quantity || Number.isNaN(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
};

const initialState = createCartSnapshot([]);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      ...initialState,
      isDrawerOpen: false,
      addItem: (product) => {
        set((state) => {
          const quantityToAdd = normalizeQuantity(product.quantity);
          const existingItem = state.items.find(
            (item) => item.productId === product.productId,
          );

          const items = existingItem
            ? state.items.map((item) =>
                item.productId === product.productId
                  ? {
                      ...item,
                      quantity: item.quantity + quantityToAdd,
                    }
                  : item,
              )
            : [
                ...state.items,
                {
                  productId: product.productId,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  slug: product.slug,
                  quantity: quantityToAdd,
                },
              ];

          return createCartSnapshot(items);
        });
      },
      removeItem: (productId) => {
        set((state) => {
          const items = state.items.filter((item) => item.productId !== productId);
          return createCartSnapshot(items);
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => {
          const nextQuantity = Math.floor(quantity);

          if (nextQuantity <= 0 || Number.isNaN(nextQuantity)) {
            const items = state.items.filter((item) => item.productId !== productId);
            return createCartSnapshot(items);
          }

          const items = state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: nextQuantity,
                }
              : item,
          );

          return createCartSnapshot(items);
        });
      },
      clearCart: () => {
        set(initialState);
      },
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
    }),
    {
      name: "affismart-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      merge: (persistedState, currentState) => {
        const persistedItems =
          (persistedState as Partial<CartState> | undefined)?.items ?? [];

        return {
          ...currentState,
          ...createCartSnapshot(persistedItems),
        };
      },
    },
  ),
);
