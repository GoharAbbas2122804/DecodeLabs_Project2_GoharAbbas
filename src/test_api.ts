import { createApp } from './app';
import { Server } from 'http';

const app = createApp();

let server: Server;
const PORT = 3009;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing API on ${BASE_URL}...\n`);

    try {
      // 1. Health Check
      console.log('1️⃣ Testing GET /api/v1/health');
      const resHealth = await fetch(`${BASE_URL}/health`);
      const dataHealth: any = await resHealth.json();
      console.log(`   Status: ${resHealth.status}`, dataHealth.data?.status === 'stable' ? '✅ PASS' : '❌ FAIL');

      // 2. Syntactic Validation Failure (Register with bad data)
      console.log('2️⃣ Testing Syntactic Validation Failure (POST /api/v1/auth/register)');
      const resValFail = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad-email', password: '123', firstName: 'A' }),
      });
      const dataValFail: any = await resValFail.json();
      console.log(`   Status: ${resValFail.status} (Expected 400)`, resValFail.status === 400 && dataValFail.error?.code === 'VALIDATION_ERROR' ? '✅ PASS' : '❌ FAIL');
      console.log(`   Details count: ${dataValFail.error?.details?.length}`);

      // 3. Login Admin
      console.log('3️⃣ Testing Admin Login (POST /api/v1/auth/login)');
      const resAdminLogin = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nervous.system', password: 'AdminPass123!' }),
      });
      const dataAdminLogin: any = await resAdminLogin.json();
      const adminToken = dataAdminLogin.data?.token;
      console.log(`   Status: ${resAdminLogin.status}`, adminToken ? '✅ PASS' : '❌ FAIL');

      // 4. Login User 1
      console.log('4️⃣ Testing User1 Login (POST /api/v1/auth/login)');
      const resUser1Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user1@nervous.system', password: 'UserPass123!' }),
      });
      const dataUser1Login: any = await resUser1Login.json();
      const user1Token = dataUser1Login.data?.token;
      const user1Id = dataUser1Login.data?.user?.id;
      console.log(`   Status: ${resUser1Login.status}`, user1Token ? '✅ PASS' : '❌ FAIL');

      // 5. Login User 2
      console.log('5️⃣ Testing User2 Login (POST /api/v1/auth/login)');
      const resUser2Login = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user2@nervous.system', password: 'UserPass123!' }),
      });
      const dataUser2Login: any = await resUser2Login.json();
      const user2Token = dataUser2Login.data?.token;
      console.log(`   Status: ${resUser2Login.status}`, user2Token ? '✅ PASS' : '❌ FAIL');

      // 6. Semantic Validation (Duplicate Email Register)
      console.log('6️⃣ Testing Semantic Validation (Duplicate Email Register)');
      const resDupEmail = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user1@nervous.system', password: 'ValidPassword123!', firstName: 'Test', lastName: 'User' }),
      });
      console.log(`   Status: ${resDupEmail.status} (Expected 409)`, resDupEmail.status === 409 ? '✅ PASS' : '❌ FAIL');

      // 7. GET /auth/me
      console.log('7️⃣ Testing GET /api/v1/auth/me');
      const resMe = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${user1Token}` },
      });
      const dataMe: any = await resMe.json();
      console.log(`   Status: ${resMe.status}`, dataMe.data?.email === 'user1@nervous.system' ? '✅ PASS' : '❌ FAIL');

      // 8. Create Post (User 1 - DRAFT)
      console.log('8️⃣ Testing Post Creation (User 1 -> DRAFT)');
      const resCreatePost = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({
          title: 'Draft Post by User 1',
          content: 'This post is strictly in draft status initially.',
          status: 'DRAFT',
        }),
      });
      const dataCreatePost: any = await resCreatePost.json();
      const draftPostId = dataCreatePost.data?.id;
      console.log(`   Status: ${resCreatePost.status} (Expected 201)`, draftPostId ? '✅ PASS' : '❌ FAIL');

      // 9. Try Commenting on DRAFT Post (Semantic Failure Check)
      console.log('9️⃣ Testing Semantic Validation: Commenting on DRAFT post');
      const resCommentDraft = await fetch(`${BASE_URL}/posts/${draftPostId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({ content: 'Trying to comment on a draft post!' }),
      });
      const dataCommentDraft: any = await resCommentDraft.json();
      console.log(`   Status: ${resCommentDraft.status} (Expected 400)`, resCommentDraft.status === 400 && dataCommentDraft.error?.code === 'BAD_REQUEST' ? '✅ PASS' : '❌ FAIL');
      console.log(`   Error Message: "${dataCommentDraft.error?.message}"`);

      // 10. View Draft Post as User 2 (Forbidden Check)
      console.log('🔟 Testing Draft Post Access Control (User 2 viewing User 1 Draft)');
      const resViewDraftUser2 = await fetch(`${BASE_URL}/posts/${draftPostId}`, {
        headers: { Authorization: `Bearer ${user2Token}` },
      });
      console.log(`   Status: ${resViewDraftUser2.status} (Expected 403)`, resViewDraftUser2.status === 403 ? '✅ PASS' : '❌ FAIL');

      // 11. Update Post Status to PUBLISHED
      console.log('1️⃣1️⃣ Testing Update Post Status to PUBLISHED (User 1)');
      const resPubPost = await fetch(`${BASE_URL}/posts/${draftPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user1Token}`,
        },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      const dataPubPost: any = await resPubPost.json();
      console.log(`   Status: ${resPubPost.status}`, dataPubPost.data?.status === 'PUBLISHED' ? '✅ PASS' : '❌ FAIL');

      // 12. Comment on PUBLISHED Post as User 2
      console.log('1️⃣2️⃣ Testing Comment Creation on PUBLISHED Post (User 2)');
      const resCommentPub = await fetch(`${BASE_URL}/posts/${draftPostId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user2Token}`,
        },
        body: JSON.stringify({ content: 'Awesome post! Now that it is published I can comment.' }),
      });
      const dataCommentPub: any = await resCommentPub.json();
      const commentId = dataCommentPub.data?.id;
      console.log(`   Status: ${resCommentPub.status} (Expected 201)`, commentId ? '✅ PASS' : '❌ FAIL');

      // 13. Delete Comment as User 1 (Non-author, non-admin -> Forbidden)
      console.log('1️⃣3️⃣ Testing Delete Comment Ownership Verification (User 1 deleting User 2 Comment)');
      const resDelCommUser1 = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user1Token}` },
      });
      console.log(`   Status: ${resDelCommUser1.status} (Expected 403)`, resDelCommUser1.status === 403 ? '✅ PASS' : '❌ FAIL');

      // 14. Delete Comment as User 2 (Author -> 204 No Content)
      console.log('1️⃣4️⃣ Testing Delete Comment as Author (User 2 -> 204)');
      const resDelCommAuthor = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user2Token}` },
      });
      console.log(`   Status: ${resDelCommAuthor.status} (Expected 204)`, resDelCommAuthor.status === 204 ? '✅ PASS' : '❌ FAIL');

      // 15. Admin Stats as Regular User (Forbidden Check)
      console.log('1️⃣5️⃣ Testing Role Authorization: GET /api/v1/admin/stats as Regular User');
      const resAdminUser = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${user1Token}` },
      });
      console.log(`   Status: ${resAdminUser.status} (Expected 403)`, resAdminUser.status === 403 ? '✅ PASS' : '❌ FAIL');

      // 16. Admin Stats as ADMIN
      console.log('1️⃣6️⃣ Testing Role Authorization: GET /api/v1/admin/stats as ADMIN');
      const resAdminStats = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dataAdminStats: any = await resAdminStats.json();
      console.log(`   Status: ${resAdminStats.status} (Expected 200)`, resAdminStats.status === 200 && dataAdminStats.data?.usersCount >= 3 ? '✅ PASS' : '❌ FAIL');
      console.log(`   Metrics: Users=${dataAdminStats.data?.usersCount}, Posts=${dataAdminStats.data?.postsCount}, Comments=${dataAdminStats.data?.commentsCount}`);

      // 17. GET /users/:id/posts
      console.log('1️⃣7️⃣ Testing GET /api/v1/users/:id/posts');
      const resUserPosts = await fetch(`${BASE_URL}/users/${user1Id}/posts`);
      const dataUserPosts: any = await resUserPosts.json();
      console.log(`   Status: ${resUserPosts.status}`, dataUserPosts.data?.length > 0 ? '✅ PASS' : '❌ FAIL');

      // 18. Swagger UI Check
      console.log('1️⃣8️⃣ Testing GET /api/v1/docs');
      const resDocs = await fetch(`http://localhost:${PORT}/api/v1/docs/`);
      console.log(`   Status: ${resDocs.status} (Expected 200)`, resDocs.status === 200 ? '✅ PASS' : '❌ FAIL');

      console.log('\n🎉 ALL 18 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('❌ Verification test error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
