import express from "express";;
import votesController from "../controllers/votes.controller.js";
const router = express.Router();

router.get("/Votes/Place/:placeId", votesController.getVotesByPlace);

router.get("/Votes/Trip/:tripId", votesController.getVotesByTrip);
export default router;