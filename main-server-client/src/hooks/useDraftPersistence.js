import { useEffect, useRef, useState } from "react";

export function useDraftPersistence(storageKey, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setValue(JSON.parse(raw));
      } else {
        setValue(initialValue);
      }
    } catch {
      setValue(initialValue);
    }
  }, [storageKey]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Ignore storage errors (quota/private mode)
      }
    }, 250);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [storageKey, value]);

  const clearDraft = () => {
    localStorage.removeItem(storageKey);
  };

  return { value, setValue, clearDraft };
}
