import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const AddressAutocomplete = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLibrary = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    try {
      const autocompleteInstance = new placesLibrary.Autocomplete(inputRef.current, {
        // Remove types restriction to allow searching by name (establishments, addresses, etc.)
        componentRestrictions: { country: "us" }, // Restrict to US locations
        fields: ["formatted_address", "name", "geometry"], // Include name field
      });

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        // Use formatted_address if available, otherwise fall back to name
        const address = place.formatted_address || place.name || "";
        if (address) {
          onChange(address);
        }
      });

      // Cleanup on unmount
      return () => {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      };
    } catch (error) {
      console.error("Error initializing Google Maps Autocomplete:", error);
    }
  }, [placesLibrary]);

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
