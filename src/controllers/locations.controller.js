import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { locationService } from '../services/locations.services.js';
import { getAuthenticatedUser } from '../utils/auth-user.js';

const getLocation = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    //get user ID from the authenticated user
    const { userId } = getAuthenticatedUser(req);

    // Aquí iría la lógica para obtener la ubicación según el tipo y el id
    const location = await locationService.getLocationByTypeAndId(userId, type, id);
    if (!location) {
      throw new ApiError(404, 'Ubicación no encontrada');
    }
   return new ApiResponse(res).success("Query result", 
    location.data);
  } catch (error) {
    next(error);
  }
};

export default { getLocation };