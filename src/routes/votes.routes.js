import express from "express";;
import votesController from "../controllers/votes.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/Votes/Place/:placeId", 
    votesController.getVotesByPlace);

router.get("/Votes/Trip/:tripId", 
    votesController.getVotesByTrip);

router.post("/Votes/:userid", 
    authenticate, 
    votesController.createVote);

export default router;