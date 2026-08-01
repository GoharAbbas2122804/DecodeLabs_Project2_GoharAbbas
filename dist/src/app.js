"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_1 = require("./config/swagger");
const routes_1 = __importDefault(require("./routes"));
const apiError_1 = require("./utils/apiError");
const createApp = () => {
    const app = (0, express_1.default)();
    // 1. Security Headers (Helmet)
    app.use((0, helmet_1.default)());
    // 2. Cross-Origin Resource Sharing (CORS)
    app.use((0, cors_1.default)());
    // 3. API Gateway Rate Limiting
    app.use('/api', rateLimiter_1.apiRateLimiter);
    // 4. Body Parsing
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // 5. Request Identification & Logging
    app.use(requestLogger_1.assignRequestId);
    app.use(requestLogger_1.morganMiddleware);
    // 6. Interactive API Documentation (Swagger UI)
    (0, swagger_1.setupSwagger)(app);
    // 7. Master API Gateway Router
    app.use('/api/v1', routes_1.default);
    // 8. 404 Handler for Unmatched Pathways
    app.use((req, _res, next) => {
        next(apiError_1.ApiError.notFound(`Path '${req.originalUrl}' not found on this Nervous System gateway`));
    });
    // 9. Centralized Error Handling Middleware (Blood-Brain Barrier output filter)
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
