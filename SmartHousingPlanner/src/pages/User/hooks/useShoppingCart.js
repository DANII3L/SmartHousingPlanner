import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useSweetAlert } from '../../../hooks/useSweetAlert';

// Hook para carrito de compras
export const useShoppingCart = () => {
  const [cart, setCart, removeCartItem, clearCart] = useLocalStorage('smartHousing_cart', []);
  const { showNotification } = useSweetAlert();

  const addToCart = (item) => {
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
  };

  const updateQuantity = (itemId, quantity) => {
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
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const removeFromCart = (itemId) => {
    const itemToRemove = cart.find(item => item.id === itemId);
    if (itemToRemove) {
      removeCartItem({ id: itemId });
      showNotification('info', 'Eliminado del carrito', `${itemToRemove.name || 'Producto'} se eliminó del carrito`);
    }
  };

  const clearCartWithNotification = () => {
    if (cart.length > 0) {
      clearCart();
      showNotification('warning', 'Carrito vaciado', 'Se eliminaron todos los productos del carrito');
    }
  };

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
