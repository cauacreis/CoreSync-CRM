import { useEffect, useState, useCallback } from 'react';
import useSound from 'use-sound';
import { clickSfx, hoverSfx, successSfx, errorSfx } from '../utils/audioAssets';

export const useAppSounds = () => {
  // Listen to local storage changes for settings
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    localStorage.getItem('@CoreSync:sound') !== 'false'
  );

  // Poll for changes to the setting since it can be changed in another screen
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('@CoreSync:sound') !== 'false';
      if (current !== isSoundEnabled) {
        setIsSoundEnabled(current);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isSoundEnabled]);

  const [playClickRaw] = useSound(clickSfx, { volume: 0.25 });
  const [playHoverRaw] = useSound(hoverSfx, { volume: 0.1 });
  const [playSuccessRaw] = useSound(successSfx, { volume: 0.4 });
  const [playErrorRaw] = useSound(errorSfx, { volume: 0.4 });

  const playClick = useCallback(() => {
    if (isSoundEnabled) playClickRaw();
  }, [isSoundEnabled, playClickRaw]);

  const playHover = useCallback(() => {
    if (isSoundEnabled) playHoverRaw();
  }, [isSoundEnabled, playHoverRaw]);

  const playSuccess = useCallback(() => {
    if (isSoundEnabled) playSuccessRaw();
  }, [isSoundEnabled, playSuccessRaw]);

  const playError = useCallback(() => {
    if (isSoundEnabled) playErrorRaw();
  }, [isSoundEnabled, playErrorRaw]);

  return { playClick, playHover, playSuccess, playError };
};

export const useGlobalButtonSounds = () => {
  const { playClick, playHover } = useAppSounds();

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playHover();
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        playClick();
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [playHover, playClick]);
};
