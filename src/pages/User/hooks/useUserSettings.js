import { useLocalStorage } from '../../../hooks/useLocalStorage';

// Hook para configuraciones del usuario
export const useUserSettings = () => {
  const [settings, setSettings, removeSetting, clearSettings] = useLocalStorage('smartHousing_userSettings', {
    theme: 'light',
    language: 'es',
    notifications: true,
    currency: 'COP'
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    settings,
    setSettings,
    updateSetting,
    removeSetting,
    clearSettings
  };
};
