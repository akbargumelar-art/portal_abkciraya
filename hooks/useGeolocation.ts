
import { useState, useCallback } from 'react';
import { GeolocationCoordinates } from '../types';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  location: GeolocationCoordinates | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    location: null,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        setState({
          loading: false,
          error: error,
          location: null,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { ...state, getLocation };
};
