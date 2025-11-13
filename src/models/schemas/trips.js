/**
 * @swagger
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       properties:
 *          name:
 *          type: string
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         initialdate:
 *           type: string
 *           format: date
 *         finaldate:
 *           type: string
 *           format: date
 *         isinternational:
 *           type: boolean
 *       required:
 *         - id
 *        - name
 *        - initialdate
 *        - finaldate
 *       - isinternational
 *      CreateTripRq:
 *          type: object
 *          properties:
 *              id:
 *                  type: string
 *              description:
 *                  type: string
 *              startDate:
 *                  type: string
 *                  format: date
 *              endDate:
 *                  type: string
 *                  format: date
 *              ownerid:
 *                  type: string
 *              required:
 *              - destination
 *              - startDate
 *              - endDate
 *              - ownerid
 *      GetTripByIDRs:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *              info:
 *                  type: array
 *                      items:   
 *                          $ref: '#/components/schemas/Trip'
 */