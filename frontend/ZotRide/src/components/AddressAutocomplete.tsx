import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder: string;
  disabled?: boolean;
}

// Global flag to track if the script is loaded
let isScriptLoading = false;
const scriptLoadCallbacks: (() => void)[] = [];

const AddressAutocomplete = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      try {
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" }, // Restrict to US addresses
        });

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });

        setAutocomplete(autocompleteInstance);
      } catch (error) {
        console.error("Error initializing Google Maps Autocomplete:", error);
      }
    };

    // If script is already loaded
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // If script is loading, queue the callback
    if (isScriptLoading) {
      scriptLoadCallbacks.push(initAutocomplete);
      return;
    }

    // Load the script
    isScriptLoading = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoading = false;
      initAutocomplete();

      // Execute all queued callbacks
      scriptLoadCallbacks.forEach(callback => callback());
      scriptLoadCallbacks.length = 0;
    };

    script.onerror = () => {
      isScriptLoading = false;
      console.error("Failed to load Google Maps script");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup autocomplete listener
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-gray-100 border-b-2 border-black px-3 py-2 focus:outline-none placeholder-black/50 rounded-t-lg"
      disabled={disabled}
    />
  );
};

export default AddressAutocomplete;
