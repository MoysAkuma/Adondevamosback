import cataloguesRepository from '../repositories/catalogues.repository.js';
import { cataloguesClient, clientPlaces, clientTrips } from '../config/supabase.js';
import exceptions from '../middleware/exceptions.middleware.js';
const cataloguesRepo = new cataloguesRepository({ cataloguesClient });

const locationService = {
  getLocationByTypeAndId: async (userId, type, id) => {
    try {
        const tableName = type === 'city' ? 'cities' : type === 'country' ? 'countries' : type === 'state' ? 'states' : null;
        const locationField = type === 'city' ? 'cityid' : type === 'country' ? 'countryid' : type === 'state' ? 'stateid' : null;

        if (!tableName || !locationField) {
          throw new Error(`Invalid location type: ${type}`);
        }

        const location = await cataloguesRepo.findOne({ tableName, id });
        if (!location) {
          return null;
        }

        const { data: places, error: placesError } = await clientPlaces
          .from('places')
          .select('id,name,countryid,stateid,cityid,address,latitude,longitude,cover_url')
          .eq(locationField, id)
          .limit(10)
          .order('id', { ascending: true });

        if (placesError) {
          throw exceptions.internal(placesError.message);
        }

        const placeIds = (places || []).map((place) => place.id);

        let trips = [];
        if (placeIds.length > 0) {
          const { data: itineraryRows, error: itineraryError } = await clientTrips
            .from('trips_itinerary')
            .select('tripid, placeid')
            .limit(10)
            .in('placeid', placeIds);

          if (itineraryError) {
            throw exceptions.internal(itineraryError.message);
          }

          const tripIds = [...new Set((itineraryRows || []).map((row) => row.tripid))];

          if (tripIds.length > 0) {
            const { data: tripsData, error: tripsError } = await clientTrips
              .from('trips')
              .select('id,name,description,initialdate,finaldate,ownerid,cover_url')
              .in('id', tripIds)
              .order('initialdate', { ascending: true });

            if (tripsError) {
              throw exceptions.internal(tripsError.message);
            }

            trips = (tripsData || []).map((trip) => ({
              ...trip,
              cover: trip.cover_url || null
            }));
          }
        }

        const placesWithCover = (places || []).map((place) => ({
          ...place,
          cover: place.cover_url || null
        }));

        return {
          ...location,
          places: placesWithCover,
          trips
        };
    } catch (error) {
      throw exceptions.internal(`Error getting location by type and id: ${error.message}`);
    }
  },
};

export { locationService };