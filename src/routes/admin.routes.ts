import { Router } from 'express';
import { getAdminStatsHandler } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.get(
  '/stats',
  requireAuth,
  requireRole(Role.ADMIN),
  getAdminStatsHandler
);

export default router;
