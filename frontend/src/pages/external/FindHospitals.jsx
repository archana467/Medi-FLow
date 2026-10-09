import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapPin, Navigation, Building2, AlertCircle } from 'lucide-react';

const FindHospitals = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  
  const [userLocation, setUserLocation] = useState(null);
  
  const fetchNearbyFacilities = async (lat, lng) => {
      setLoading(true);
      setError('');
      try {
          // api.js adds /api automatically if missing, but let's be safe
          const res = await api.get(`/external/facilities/nearby?lat=${lat}&lng=${lng}&radius=10`);
          if (res.data?.success) {
              setFacilities(res.data.data);
              if (res.data.status === 'fallback') {
                  // If it's fallback data, maybe show a small banner, but user asked not to break things.
                  console.warn(res.data.message);
              }
          } else {
              setError(res.data?.message || 'Failed to load facilities');
          }
      } catch (err) {
          setError(err.response?.data?.message || 'An error occurred while fetching facilities');
      } finally {
          setLoading(false);
      }
  };

  const requestLocation = () => {
      setLocationError('');
      if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by your browser');
          return;
      }
      
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              fetchNearbyFacilities(latitude, longitude);
          },
          (err) => {
              setLoading(false);
              setLocationError('Location permission denied. Please allow location access to find nearby hospitals.');
          }
      );
  };

  useEffect(() => {
      requestLocation();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nearby Hospitals (ABDM)</h1>
          <p className="text-sm text-slate-500 mt-1">Find healthcare facilities near you using official registries</p>
        </div>
        <button onClick={requestLocation} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Navigation className="w-5 h-5" />
          Update Location
        </button>
      </div>

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Location Access Required</p>
            <p className="text-sm mt-1">{locationError}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Finding nearby facilities...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1" title={facility.name}>{facility.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 mt-1">
                          {facility.facilityType || 'Healthcare Facility'}
                      </span>
                  </div>
               </div>
               
               <div className="space-y-2 mt-4 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span>{facility.address || 'Address not available'}, {facility.city}</span>
                  </div>
               </div>
               
               <div className="mt-6">
                   <button className="w-full bg-slate-50 text-slate-700 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-100 transition-colors">
                       View Details
                   </button>
               </div>
            </div>
          ))}
          {!loading && facilities.length === 0 && !locationError && (
              <div className="col-span-full text-center py-12 text-slate-500">
                  No facilities found nearby.
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindHospitals;
