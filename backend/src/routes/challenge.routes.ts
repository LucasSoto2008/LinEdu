import { Router } from 'express';
import { getChallenge, validateCommand } from '../controllers/challenge.controller';

const router = Router();

router.get('/:id', getChallenge);
router.post('/validate', validateCommand);

export default router;
