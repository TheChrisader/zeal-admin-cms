import { useState, useEffect } from "react";

function useLocalStorage(key: string, initialValue: any) {
  // State to store the current value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse and return item or return initialValue
      return item
        ? typeof item === "string"
          ? item
          : JSON.parse(item)
        : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  // Function to update the value in state and localStorage
  const setValue = (value: any) => {
    try {
      // Allow value to be a function (similar to setState in useState)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(
        key,
        typeof valueToStore === "string"
          ? valueToStore
          : JSON.stringify(valueToStore)
      );
    } catch (error) {
      console.error("Error setting localStorage key:", key, error);
    }
  };

  // Remove the item from localStorage
  const removeValue = () => {
    try {
      // Remove item from local storage
      window.localStorage.removeItem(key);
      // Reset state
      setStoredValue(undefined);
    } catch (error) {
      console.error("Error removing localStorage key:", key, error);
    }
  };

  useEffect(() => {
    // Update state if the item changes outside of the hook
    const handleStorageChange = (event: any) => {
      if (event.key === key) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : undefined);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
