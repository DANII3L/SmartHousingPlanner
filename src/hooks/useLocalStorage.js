import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
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
      localStorage.removeItem(key);
    } catch (error) {
    }
  };

  return [storedValue, setValue, removeItem, clearValue];
};
