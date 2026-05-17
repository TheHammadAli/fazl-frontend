import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const CART_STORAGE_KEY = "productCart";

export type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  shopId?: string;
  ownerId?: string;
  selectedVariants: Record<string, string>;
  quantity: number;
  sellerLabel: string;
  sellerImage: string;
};

export type AddToCartPayload = Omit<CartItem, "id" | "quantity"> & {
  quantity?: number;
};

function persistCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
}

export function getCartLineId(
  productId: string,
  selectedVariants: Record<string, string>,
): string {
  const variantKey = Object.keys(selectedVariants)
    .sort()
    .map((key) => `${key}:${selectedVariants[key]}`)
    .join("|");
  return `${productId}__${variantKey}`;
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage(),
  },
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { quantity = 1, ...item } = action.payload;
      const id = getCartLineId(item.productId, item.selectedVariants);
      const existing = state.items.find((line) => line.id === id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...item, id, quantity });
      }

      persistCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistCart(state.items);
    },
    updateCartQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const item = state.items.find((line) => line.id === action.payload.id);
      if (!item) return;

      if (action.payload.quantity < 1) {
        state.items = state.items.filter((line) => line.id !== action.payload.id);
      } else {
        item.quantity = action.payload.quantity;
      }

      persistCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persistCart(state.items);
    },
    hydrateCart: (state) => {
      state.items = loadCartFromStorage();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
