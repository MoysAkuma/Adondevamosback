/**
 * @swagger
 * /Country:
 *   post:
 *     summary: Retrieve a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 */
app.post('/Country', (req, res) => {
  res.json({
        "Message": "Creation process sucess",
        "info": [
            {
                "id": 4,
                "createddate": "2025-05-25T19:20:08.278003+00:00",
                "name": "Peru",
                "originalname": "Peru",
                "hide": false,
                "enabled": true,
                "acronym": "PER"
            }
        ]
    });
});