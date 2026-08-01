"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.requireAuth, (0, auth_1.requireRole)(types_1.Role.ADMIN), admin_controller_1.getAdminStatsHandler);
exports.default = router;
