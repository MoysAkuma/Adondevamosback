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

/**
 * Matches ubication names with their corresponding countryid, stateid, cityid in object.
 * @param {Object} ubicationContainer - Object containing ubication ids
 * @param {Object} ubicationNames - Object containing { countries, states, cities } arrays
 * @returns {Object} - Enriched ubicationContainer with Country, State, City objects
 */
export function matchUbicationNames(ubicationContainer, ubicationNames) {
  if (!ubicationContainer || !ubicationContainer.data || !Array.isArray(ubicationContainer.data)) {
    return { status: 500, error: "Invalid ubication container" };
  }
  
  const countries = ubicationNames?.data?.countries || [];
  const states = ubicationNames?.data?.states || [];
  const cities = ubicationNames?.data?.cities || [];

  ubicationContainer.data = ubicationContainer.data.map(item => {
    const country = countries.find(c => c.id === item.countryid);
    const state = states.find(s => s.id === item.stateid);
    const city = cities.find(ci => ci.id === item.cityid);
    
    const { countryid, stateid, cityid, ...restItem } = item;
    
    return {
      ...restItem,
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

  return ubicationContainer;
}