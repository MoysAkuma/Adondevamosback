/**
 * Maps place objects with their ubication names (country, state, city).
 * @param {Array} places - Array of place objects with countryid, stateid, cityid
 * @param {Object} ubicationNames - Object containing { countries, states, cities } arrays
 * @returns {Array} - Enriched places with Country, State, City objects
 */
export function mapPlacesWithUbicationNames(places, ubicationNames) {
  if (!places || !Array.isArray(places)) return [];
  
  const countries = ubicationNames?.countries || [];
  const states = ubicationNames?.states || [];
  const cities = ubicationNames?.cities || [];

  return places.map(place => {
    const country = countries.find(c => c.id === place.countryid);
    const state = states.find(s => s.id === place.stateid);
    const city = cities.find(ci => ci.id === place.cityid);
    
    return {
      ...place,
      Country: country ? {
        id: country.id,
        name: country.name,
        acronym: country.acronym
      } : null,
      State: state ? {
        id: state.id,
        name: state.name
      } : null,
      City: city ? {
        id: city.id,
        name: city.name
      } : null
    };
  });
}