"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const types_1 = require("../src/types");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Database Seeding...');
    // Clean existing database
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
    const adminPasswordHash = await bcryptjs_1.default.hash('AdminPass123!', 12);
    const userPasswordHash = await bcryptjs_1.default.hash('UserPass123!', 12);
    // 1. Create Admin User
    const admin = await prisma.user.create({
        data: {
            email: 'admin@nervous.system',
            passwordHash: adminPasswordHash,
            role: types_1.Role.ADMIN,
            profile: {
                create: {
                    firstName: 'System',
                    lastName: 'Admin',
                    bio: 'Nervous System Core Administrator',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                },
            },
        },
        include: { profile: true },
    });
    // 2. Create Regular User 1
    const user1 = await prisma.user.create({
        data: {
            email: 'user1@nervous.system',
            passwordHash: userPasswordHash,
            role: types_1.Role.USER,
            profile: {
                create: {
                    firstName: 'Synapse',
                    lastName: 'One',
                    bio: 'Primary neural processing node.',
                    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                },
            },
        },
        include: { profile: true },
    });
    // 3. Create Regular User 2
    const user2 = await prisma.user.create({
        data: {
            email: 'user2@nervous.system',
            passwordHash: userPasswordHash,
            role: types_1.Role.USER,
            profile: {
                create: {
                    firstName: 'Dendrite',
                    lastName: 'Two',
                    bio: 'Secondary signal receptor node.',
                    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                },
            },
        },
        include: { profile: true },
    });
    console.log(`✅ Users created: Admin (${admin.email}), User 1 (${user1.email}), User 2 (${user2.email})`);
    // 4. Create Posts
    const post1 = await prisma.post.create({
        data: {
            userId: admin.id,
            title: 'Architectural Philosophy of the Nervous System',
            content: 'The Nervous System API models biological pathways: Input-Process-Output cycles, synaptic network transport, and the Blood-Brain Barrier for request validation.',
            status: types_1.PostStatus.PUBLISHED,
        },
    });
    const post2 = await prisma.post.create({
        data: {
            userId: admin.id,
            title: 'Blood-Brain Barrier: Two-Layer Validation in REST APIs',
            content: 'Never trust the client. Syntactic validation verifies standard formats with Zod, while Semantic validation enforces business logic in the service layer.',
            status: types_1.PostStatus.PUBLISHED,
        },
    });
    const post3 = await prisma.post.create({
        data: {
            userId: admin.id,
            title: 'Drafting Synaptic Protocols for Project 3',
            content: 'This is an internal draft outlining future protocol extensions. Unauthenticated users cannot view this content.',
            status: types_1.PostStatus.DRAFT,
        },
    });
    const post4 = await prisma.post.create({
        data: {
            userId: user1.id,
            title: 'Neural Pathways in Modern Web Applications',
            content: 'By treating APIs as sensory organs and motor outputs, we decouple business domain services from raw transport payloads.',
            status: types_1.PostStatus.PUBLISHED,
        },
    });
    const post5 = await prisma.post.create({
        data: {
            userId: user2.id,
            title: 'Work in Progress: Reflex Arc Middleware',
            content: 'Draft study on fast-path short-circuiting in express middleware for early error detection.',
            status: types_1.PostStatus.DRAFT,
        },
    });
    console.log(`✅ 5 Posts created (3 Published, 2 Draft).`);
    // 5. Create Comments (10 total on Published Posts)
    const commentsData = [
        { postId: post1.id, userId: user1.id, content: 'Fascinating concept! The biological analogy fits modern micro-architectures well.' },
        { postId: post1.id, userId: user2.id, content: 'Agreed. Input-Process-Output cycles make error isolation much simpler.' },
        { postId: post1.id, userId: admin.id, content: 'Thank you both. Precision in system boundaries is crucial.' },
        { postId: post2.id, userId: user1.id, content: 'Zod schemas catching malformed JSON at the edge saves so much service complexity.' },
        { postId: post2.id, userId: user2.id, content: 'Does semantic validation also handle rate limiting or is that done earlier in the Gateway?' },
        { postId: post2.id, userId: admin.id, content: 'Rate limiting acts as an outer membrane before syntactic checks occur.' },
        { postId: post4.id, userId: admin.id, content: 'Great perspective on sensor vs motor outputs in REST Controllers.' },
        { postId: post4.id, userId: user2.id, content: 'Looking forward to seeing how JWT statelessness integrates with the frontend skin.' },
        { postId: post4.id, userId: user1.id, content: 'Thanks! The frontend will consume JSON neurotransmitters smoothly.' },
        { postId: post4.id, userId: admin.id, content: 'Ensuring zero session state on the server guarantees horizontal scalability.' },
    ];
    for (const c of commentsData) {
        await prisma.comment.create({ data: c });
    }
    console.log(`✅ 10 Comments created successfully.`);
    console.log('🚀 Database Seeding Complete!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
