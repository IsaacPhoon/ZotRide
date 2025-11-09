import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  Marker,
} from "@vis.gl/react-google-maps";

interface RouteMapProps {
  pickupAddress: string;
  destinationAddress: string;
}

const Directions = ({ pickupAddress, destinationAddress }: RouteMapProps) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const geocodingLibrary = useMapsLibrary("geocoding");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex] = useState(0);
  const [pickupCoords, setPickupCoords] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [destinationCoords, setDestinationCoords] =
    useState<google.maps.LatLngLiteral | null>(null);

  // Initialize directions service, renderer, and geocoder
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());

    // Configure DirectionsRenderer without default markers (we'll add custom ones)
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#3b82f6",
        strokeWeight: 5,
        strokeOpacity: 0.8,
      },
    });

    setDirectionsRenderer(renderer);

    // Cleanup on unmount
    return () => {
      renderer.setMap(null);
    };
  }, [routesLibrary, map]);

  // Initialize geocoder
  useEffect(() => {
    if (!geocodingLibrary) return;
    setGeocoder(new geocodingLibrary.Geocoder());
  }, [geocodingLibrary]);

  // Geocode pickup address when it changes (even if destination is not set)
  useEffect(() => {
    if (!geocoder || !pickupAddress) {
      setPickupCoords(null);
      return;
    }

    geocoder.geocode({ address: pickupAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        setPickupCoords({ lat: location.lat(), lng: location.lng() });

        // Center map on pickup if no destination yet
        if (!destinationAddress && map) {
          map.panTo({ lat: location.lat(), lng: location.lng() });
          map.setZoom(14);
        }
      } else {
        console.error("Geocoding pickup failed:", status);
        setPickupCoords(null);
      }
    });
  }, [geocoder, pickupAddress, destinationAddress, map]);

  // Geocode destination address when it changes (even if pickup is not set)
  useEffect(() => {
    if (!geocoder || !destinationAddress) {
      setDestinationCoords(null);
      return;
    }

    geocoder.geocode({ address: destinationAddress }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        setDestinationCoords({ lat: location.lat(), lng: location.lng() });

        // Center map on destination if no pickup yet
        if (!pickupAddress && map) {
          map.panTo({ lat: location.lat(), lng: location.lng() });
          map.setZoom(14);
        }
      } else {
        console.error("Geocoding destination failed:", status);
        setDestinationCoords(null);
      }
    });
  }, [geocoder, destinationAddress, pickupAddress, map]);

  // Use directions service to get route ONLY when both addresses are present
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    if (!pickupAddress || !destinationAddress) {
      // Clear the route if either address is missing
      setRoutes([]);
      return;
    }

    directionsService
      .route({
        origin: pickupAddress,
        destination: destinationAddress,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      })
      .then((response: google.maps.DirectionsResult) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);

        // Update coordinates from the precise route (more accurate than geocoding)
        if (response.routes.length > 0) {
          const route = response.routes[0];
          const leg = route.legs[0];

          const startLoc = leg.start_location;
          const endLoc = leg.end_location;

          setPickupCoords({ lat: startLoc.lat(), lng: startLoc.lng() });
          setDestinationCoords({ lat: endLoc.lat(), lng: endLoc.lng() });
        }
      })
      .catch((error: any) => {
        console.error("Error fetching directions:", error);
        setRoutes([]);
      });
  }, [
    directionsService,
    directionsRenderer,
    pickupAddress,
    destinationAddress,
  ]);

  // Update direction route when route index changes
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  // Display route info if available
  if (!routes || routes.length === 0) return null;

  const selectedRoute = routes[routeIndex];
  const leg = selectedRoute.legs[0];

  return (
    <>
      {/* Pickup Marker (Green) */}
      {pickupCoords && (
        <Marker
          position={pickupCoords}
          title="Pickup Location"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}

      {/* Destination Marker (Red) */}
      {destinationCoords && (
        <Marker
          position={destinationCoords}
          title="Destination"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}

      {/* Route Information Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg border-2 border-black z-10 max-w-xs">
        <h3 className="font-bold text-lg mb-2">Route Information</h3>
        <div className="flex items-start gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-600">Pickup</p>
            <p className="text-sm">{leg.start_address}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-600">Destination</p>
            <p className="text-sm">{leg.end_address}</p>
          </div>
        </div>
        <p className="text-sm">
          <span className="font-semibold">Distance:</span> {leg.distance?.text}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Duration:</span> {leg.duration?.text}
        </p>
      </div>
    </>
  );
};

const RouteMap = ({ pickupAddress, destinationAddress }: RouteMapProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Default center (UCI campus)
  const defaultCenter = { lat: 33.6405, lng: -117.8443 };

  const hasRoute = pickupAddress && destinationAddress;

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border-2 border-black relative">
      {!hasRoute && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="text-center p-8">
            <h3 className="text-2xl font-bold mb-2">Enter Route Details</h3>
            <p className="text-gray-600">
              Select pickup and destination locations to see the route on the
              map
            </p>
          </div>
        </div>
      )}
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          mapId="route-map"
        >
          {hasRoute && (
            <Directions
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

export default RouteMap;
