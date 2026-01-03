import VotesRepository from "../repositories/votes.repository";
import { votesClient } from "../config/supabase.js";
const votesRepositoryInstance = new VotesRepository({ votesClient });

const votesService = {
  
};
export default votesService;
