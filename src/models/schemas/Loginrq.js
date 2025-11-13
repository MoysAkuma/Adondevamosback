const LoginRq = {
    id: String,
    password: String
}
export default LoginRq;
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRq:
 *       type: object
 *       properties:
 *         id:
 *          type: string
 *         description: Email or Tag ID of the user
 *        password:
 *         type: string
 *        description: Password of the user
 *      required:
 *      - id
 *     - password
 *     LoginRs:
 *       type: object
 *       properties:
 *         id:
 *          type: string
 *         description: Email or Tag ID of the user
 *        password:
 *         type: string
 *        description: Password of the user
 *      required:
 *      - id
 *     - password
 */