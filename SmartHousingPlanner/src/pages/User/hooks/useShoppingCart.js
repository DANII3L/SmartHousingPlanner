import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

// Hook para carrito de compras
export const useShoppingCart = () => {
  const [cart, setCart, removeCartItem, clearCart] = useLocalStorage('smartHousing_cart', []);
  const { showNotification } = useSweetAlert();

  const addToCart = useCallback((item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(prev => prev.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
      showNotification('success', 'Cantidad actualizada', `Se agregó una unidad más de ${item.name || 'producto'}`);
    } else {
      setCart(prev => [...prev, { ...item, quantity: 1 }]);
      showNotification('success', '¡Agregado al carrito!', `${item.name || 'Producto'} se agregó al carrito`);
    }
  }, [cart, setCart, showNotification]);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      const itemToRemove = cart.find(item => item.id === itemId);
      if (itemToRemove) {
        removeCartItem({ id: itemId });
        showNotification('info', 'Eliminado del carrito', `${itemToRemove.name || 'Producto'} se eliminó del carrito`);
      }
    } else {
      setCart(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      
      const updatedItem = cart.find(item => item.id === itemId);
      if (updatedItem) {
        showNotification('success', 'Cantidad actualizada', `Cantidad de ${updatedItem.name || 'producto'} actualizada a ${quantity}`);
      }
    }
  }, [cart, setCart, removeCartItem, showNotification]);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Funciones wrapper para mantener la compatibilidad
  const getTotalItems = useCallback(() => totalItems, [totalItems]);
  const getTotalPrice = useCallback(() => totalPrice, [totalPrice]);

  const removeFromCart = useCallback((itemId) => {
    const itemToRemove = cart.find(item => item.id === itemId);
    if (itemToRemove) {
      removeCartItem({ id: itemId });
      showNotification('info', 'Eliminado del carrito', `${itemToRemove.name || 'Producto'} se eliminó del carrito`);
    }
  }, [cart, removeCartItem, showNotification]);

  const clearCartWithNotification = useCallback(() => {
    if (cart.length > 0) {
      clearCart();
      showNotification('warning', 'Carrito vaciado', 'Se eliminaron todos los productos del carrito');
    }
  }, [cart.length, clearCart, showNotification]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: clearCartWithNotification,
    getTotalItems,
    getTotalPrice
  };
};
