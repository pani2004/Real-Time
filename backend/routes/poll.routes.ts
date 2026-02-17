import { Router } from 'express';
import { createPoll, getPoll, voteOnPoll } from '../controller/poll.controller.js';
import { ipTracker } from '../middleware/ipTracker.js';

const router = Router();

// Create a new poll
router.post('/', createPoll);

// Get poll by ID
router.get('/:pollId', getPoll);

// Vote on a poll (with IP tracking)
router.post('/:pollId/vote', ipTracker, voteOnPoll);

export default router;
