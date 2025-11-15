import { useState, useEffect } from 'react';

const isBrowser = typeof window !== 'undefined';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (!isBrowser) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('useLocalStorage: error reading key', key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (!isBrowser) return undefined;
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn('useLocalStorage: error parsing storage event', error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const setValue = (value) => {
    if (!isBrowser) return;
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('useLocalStorage: error setting key', key, error);
    }
  };

  const removeItem = (itemToRemove) => {
    try {
      if (Array.isArray(storedValue)) {
        const newValue = storedValue.filter(item => {
          if (typeof item === 'object' && item.id) {
            return item.id !== itemToRemove.id;
          }
          return item !== itemToRemove;
        });
        setValue(newValue);
      } else if (typeof storedValue === 'object' && storedValue !== null) {
        const newValue = { ...storedValue };
        delete newValue[itemToRemove];
        setValue(newValue);
      }
    } catch (error) {
    }
  };

  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      if (isBrowser) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('useLocalStorage: error clearing key', key, error);
    }
  };

  return [storedValue, setValue, removeItem, clearValue];
};
