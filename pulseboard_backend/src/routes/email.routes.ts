import { Router } from 'express';
import { handleInboundEmail } from '../controllers/email.controller';

const router = Router();

/**
 * POST /api/email/inbound
 * Mailgun inbound webhook — no JWT auth (Mailgun calls this externally).
 * Accepts both multipart/form-data (Mailgun) and application/json (testing).
 */
router.post('/inbound', handleInboundEmail);

export default router;
