import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const getLocation = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    // Aquí iría la lógica para obtener la ubicación según el tipo y el id
    const location = {}; // Reemplazar con la lógica real
    if (!location) {
      throw new ApiError(404, 'Ubicación no encontrada');
    }
    ApiResponse.success(res, location);
  } catch (error) {
    next(error);
  }
};

export { getLocation };