const fs = require('fs');
let content = fs.readFileSync('src/pages/user/NearbyHospitals.tsx', 'utf8');

const regex = /try\s*\{\s*if \(\!window\.google \|\| \!window\.google\.maps \|\| \!window\.google\.maps\.places\) \{[\s\S]*?console\.error\(err\);\s*\}/m;

const newImplementation = `
        try {
          if (!window.google || !window.google.maps) {
            throw new Error('Google Maps script not loaded');
          }

          // Use the modern Places API (New) via Place.searchNearby
          // First, we need to ensure the places library is loaded
          const { Place } = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary;
          
          if (!Place) {
             throw new Error('Places API (New) not available');
          }

          const request = {
            fields: ['displayName', 'location', 'formattedAddress', 'nationalPhoneNumber', 'primaryTypeDisplayName', 'id'],
            locationRestriction: {
              center: { lat: latitude, lng: longitude },
              radius: 10000, // 10km
            },
            includedPrimaryTypes: ['hospital'],
            maxResultCount: 20,
          };

          const { places } = await Place.searchNearby(request);

          if (places && places.length > 0) {
            const fetched = places.map((place: any) => {
              const lat = place.location?.lat() || 0;
              const lon = place.location?.lng() || 0;
              return {
                id: place.id || Math.random().toString(),
                name: place.displayName || 'Unknown Hospital',
                lat,
                lon,
                address: place.formattedAddress || 'Address not available',
                mobile: place.nationalPhoneNumber || '',
                type: place.primaryTypeDisplayName || 'Hospital',
                distance: getDistance(latitude, longitude, lat, lon),
              };
            }).filter((h: any) => h.lat !== 0 && h.lon !== 0);

            fetched.sort((a: any, b: any) => a.distance - b.distance);
            setHospitals(fetched);
          } else {
             setHospitals([]);
          }
        } catch (err) {
          setError("Failed to fetch nearby hospitals from Google Maps. Please try again.");
          console.error(err);
        } finally {
          setLoading(false);
        }
`;

content = content.replace(regex, newImplementation);
fs.writeFileSync('src/pages/user/NearbyHospitals.tsx', content);
