const fs = require('fs');
let content = fs.readFileSync('src/pages/user/NearbyHospitals.tsx', 'utf8');

const regex = /try\s*\{\s*\/\/ Use Overpass API to get real hospitals[\s\S]*?catch\s*\(err\)\s*\{\s*setError\("Failed to fetch nearby hospitals\. Please try again\."\);\s*console\.error\(err\);\s*\}/m;

const newImplementation = `
        try {
          if (!window.google || !window.google.maps || !window.google.maps.places) {
            throw new Error('Google Maps script not loaded');
          }

          const map = new google.maps.Map(document.createElement('div'));
          const service = new google.maps.places.PlacesService(map);
          const userLocation = new google.maps.LatLng(latitude, longitude);

          const request = {
            location: userLocation,
            radius: 10000, // 10km
            type: 'hospital'
          };

          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              const fetched = results.map(place => {
                const lat = place.geometry?.location?.lat() || 0;
                const lon = place.geometry?.location?.lng() || 0;
                return {
                  id: place.place_id || Math.random().toString(),
                  name: place.name || 'Unknown Hospital',
                  lat,
                  lon,
                  address: place.vicinity || 'Address not available',
                  mobile: '', // PlacesService nearbySearch doesn't return phone numbers by default. Place Details request would be needed per place.
                  type: 'Hospital',
                  distance: getDistance(latitude, longitude, lat, lon),
                  rating: place.rating,
                  userRatingsTotal: place.user_ratings_total
                };
              }).filter(h => h.lat !== 0 && h.lon !== 0);

              fetched.sort((a, b) => a.distance - b.distance);
              setHospitals(fetched.slice(0, 20));
              setLoading(false);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
               setHospitals([]);
               setLoading(false);
            } else {
              setError("Failed to fetch nearby hospitals from Google Maps. Please try again.");
              setLoading(false);
            }
          });
          
          return; // The callback handles the state updates
        } catch (err) {
          setError("Failed to fetch nearby hospitals. Please try again.");
          console.error(err);
        }
`;

content = content.replace(regex, newImplementation);

// Also need to remove the finally block since the Google Maps callback handles setLoading(false)
content = content.replace(/\s*finally\s*\{\s*setLoading\(false\);\s*\}/, "");

fs.writeFileSync('src/pages/user/NearbyHospitals.tsx', content);
