import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'superset-cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, action.item.stock || 99) }
            : i
        );
      }
      return [...state, action.item];
    }
    case 'SET_QTY':
      return state
        .map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.stock || 99)) }
            : i
        )
        .filter((i) => i.quantity > 0);
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.productId);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
    return {
      items,
      itemCount,
      subtotalCents,
      subtotal: subtotalCents / 100,
      addItem: (product, quantity = 1) =>
        dispatch({
          type: 'ADD',
          item: {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            vialSize: product.vialSize,
            priceCents: product.priceCents,
            stock: product.stock,
            imageColor: product.imageColor,
            quantity,
          },
        }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: 'SET_QTY', productId, quantity }),
      removeItem: (productId) => dispatch({ type: 'REMOVE', productId }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
