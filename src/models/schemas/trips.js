const trip = {
    id: String,
    destination: String,
    startDate: Date,
    endDate: Date,
    userId: String  
}
export default trip;
/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         destination:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         userId:
 *           type: string
 *       required:
 *         - id
 *         - destination
 *         - startDate
 *         - endDate
 *         - userId
 */