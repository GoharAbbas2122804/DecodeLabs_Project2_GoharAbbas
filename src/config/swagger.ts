import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Project 2: The Nervous System API',
    version: '1.0.0',
    description: `
**The Nervous System** is a RESTful Content Management API connecting Project 1 ("The Skin") to backend data services.

### Biological Architecture Principles
- **Blood-Brain Barrier (Validation)**: Two-layer input defense (Syntactic via Zod, Semantic via Service domain rules).
- **Synaptic Neurotransmitters**: Standardized JSON responses with request metadata and standard HTTP status codes.
- **Stateless Nervous Pathways**: JWT Authentication via HTTP \`Authorization: Bearer <token>\`.

### Authentication Instructions
1. Register a new user at \`POST /api/v1/auth/register\` or login with seed accounts:
   - **Admin**: \`admin@nervous.system\` / \`AdminPass123!\`
   - **User**: \`user1@nervous.system\` / \`UserPass123!\`
2. Copy the returned JWT token.
3. Click **Authorize** button below and enter \`Bearer <token>\`.
    `,
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Syntactic validation failure' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string', example: 'password' },
                    message: { type: 'string', example: 'Password must contain at least one uppercase letter' },
                  },
                },
              },
            },
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', example: '2026-08-01T21:51:24.000Z' },
              requestId: { type: 'string', example: 'd8c0f5f8-8a21-4f11-9a72-74891b29a842' },
            },
          },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'USER'] },
          createdAt: { type: 'string', format: 'date-time' },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              bio: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
        },
      },
      PostResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          commentsCount: { type: 'number' },
        },
      },
      CommentResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          author: { $ref: '#/components/schemas/UserResponse' },
        },
      },
    },
  },
  tags: [
    { name: 'System', description: 'System integrity & health endpoints' },
    { name: 'Auth', description: 'User registration, login & self-identification' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Posts', description: 'Portfolio post publishing & drafting' },
    { name: 'Comments', description: 'Post comments and discussions' },
    { name: 'Admin', description: 'Administrative statistics & oversight' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['System'],
        summary: 'Check API system integrity and status',
        description: 'Returns the operational health, current timestamp, and server uptime.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET http://localhost:3000/api/v1/health\n```',
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: { status: 'stable', timestamp: '2026-08-01T21:51:24.000Z', uptime: '42s' },
                  meta: { timestamp: '2026-08-01T21:51:24.000Z', requestId: '3f2567a0-0000-0000-0000-000000000000' },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a user account and profile with password hashing.\n\n**Executable Curl Example:**\n```bash\ncurl -X POST http://localhost:3000/api/v1/auth/register \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"newuser@nervous.system","password":"SecurePassword123!","firstName":"Jane","lastName":"Doe"}\'\n```',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', example: 'newuser@nervous.system' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                  firstName: { type: 'string', example: 'Jane' },
                  lastName: { type: 'string', example: 'Doe' },
                  bio: { type: 'string', example: 'Full Stack Engineer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User successfully created' },
          '400': { description: 'Syntactic validation error (invalid email format or weak password)' },
          '409': { description: 'Email address already registered' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user & issue JWT token',
        description: 'Verifies password hash and returns JWT access token.\n\n**Executable Curl Example:**\n```bash\ncurl -X POST http://localhost:3000/api/v1/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"admin@nervous.system","password":"AdminPass123!"}\'\n```',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@nervous.system' },
                  password: { type: 'string', example: 'AdminPass123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Authentication successful' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [{ BearerAuth: [] }],
        description: 'Returns profile details for the user identified by Bearer JWT.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET http://localhost:3000/api/v1/auth/me \\\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"\n```',
        responses: {
          '200': { description: 'Authenticated user profile' },
          '401': { description: 'Missing or invalid token' },
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'Get paginated list of users',
        description: 'Returns users with public post counts.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10"\n```',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'Paginated user list' },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile by UUID',
        description: 'Includes user profile and posts.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET http://localhost:3000/api/v1/users/<USER_UUID>\n```',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'User profile and posts' },
          '404': { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile (Owner or ADMIN)',
        security: [{ BearerAuth: [] }],
        description: 'Updates profile fields.\n\n**Executable Curl Example:**\n```bash\ncurl -X PUT http://localhost:3000/api/v1/users/<USER_UUID> \\\n  -H "Authorization: Bearer <TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"firstName":"UpdatedName"}\'\n```',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Profile updated' },
          '403': { description: 'Forbidden: Cannot update another user' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account (Owner or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'User account deleted' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/v1/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts feed',
        description: 'Public users see PUBLISHED posts. Authenticated users can query `?mine=true` to view their drafts.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET "http://localhost:3000/api/v1/posts?page=1&limit=10"\n```',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'mine', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { '200': { description: 'List of posts' } },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a new post',
        security: [{ BearerAuth: [] }],
        description: 'Creates a post in DRAFT or PUBLISHED status.\n\n**Executable Curl Example:**\n```bash\ncurl -X POST http://localhost:3000/api/v1/posts \\\n  -H "Authorization: Bearer <TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title":"New Portfolio Article","content":"This is comprehensive post content.","status":"PUBLISHED"}\'\n```',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'content'],
                properties: {
                  title: { type: 'string', example: 'New Portfolio Article' },
                  content: { type: 'string', example: 'This is comprehensive post content.' },
                  status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Post created' },
          '400': { description: 'Syntactic validation failure' },
        },
      },
    },
    '/api/v1/posts/{id}': {
      get: {
        tags: ['Posts'],
        summary: 'Get post by UUID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Post details' },
          '403': { description: 'Forbidden: Draft post access restricted' },
          '404': { description: 'Post not found' },
        },
      },
      put: {
        tags: ['Posts'],
        summary: 'Update post (Author or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Post updated' },
          '403': { description: 'Forbidden: Not post owner' },
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Delete post (Author or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Post deleted' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/v1/posts/{id}/comments': {
      get: {
        tags: ['Comments'],
        summary: 'Get comments for a post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'List of comments' } },
      },
      post: {
        tags: ['Comments'],
        summary: 'Add comment to a post (Authenticated)',
        security: [{ BearerAuth: [] }],
        description: 'Semantic Validation: Target post must exist and be status PUBLISHED.\n\n**Executable Curl Example:**\n```bash\ncurl -X POST http://localhost:3000/api/v1/posts/<POST_UUID>/comments \\\n  -H "Authorization: Bearer <TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"content":"Insightful article!"}\'\n```',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', example: 'Insightful article!' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Comment created' },
          '400': { description: 'Semantic check failed (e.g. attempting to comment on DRAFT post)' },
        },
      },
    },
    '/api/v1/comments/{id}': {
      delete: {
        tags: ['Comments'],
        summary: 'Delete comment (Author or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'Comment deleted' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/v1/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get system counts (ADMIN only)',
        security: [{ BearerAuth: [] }],
        description: 'Returns count of users, posts, and comments.\n\n**Executable Curl Example:**\n```bash\ncurl -X GET http://localhost:3000/api/v1/admin/stats \\\n  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"\n```',
        responses: {
          '200': { description: 'System metrics statistics' },
          '403': { description: 'Forbidden: Requires ADMIN role' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
