import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as otpService from "./otp_service.tsx";
import { seedData } from "./seed.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const getAnonClient = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Initialize storage bucket
const initializeBucket = async () => {
  const supabase = getServiceClient();
  const bucketName = 'make-324f6e20-documents';
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
    console.log(`Created storage bucket: ${bucketName}`);
  }
};

// Initialize bucket on startup
initializeBucket().catch(console.error);

// Health check endpoint
app.get("/make-server-324f6e20/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Sign up endpoint
app.post("/make-server-324f6e20/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    if (!['applicant', 'admin', 'analyst', 'qa', 'cfo', 'finance', 'management'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }
    
    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      phoneNumber: '+1-555-0000', // Default placeholder phone number
      isActive: true, // New users are active by default
      createdAt: new Date().toISOString()
    });
    
    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get current user
app.get("/make-server-324f6e20/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }
    
    const supabase = getServiceClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get user profile from KV store
    const profile = await kv.get(`user:${user.id}`);
    
    // Check if user account is active
    if (profile?.isActive === false) {
      return c.json({ error: 'Account has been deactivated. Please contact an administrator.' }, 403);
    }
    
    // If user doesn't have organizationId in profile but has a linked organization, fetch it
    let organizationId = profile?.organizationId;
    if (!organizationId && (profile?.role === 'ASSET_FINANCIER_ADMIN' || profile?.role === 'ASSET_FINANCIER_STAFF')) {
      const linkedOrgId = await kv.get(`user:${user.id}:organization`);
      if (linkedOrgId) {
        organizationId = linkedOrgId;
      }
    }
    
    return c.json({
      id: user.id,
      email: user.email,
      ...user.user_metadata,
      ...profile,
      organizationId: organizationId || profile?.organizationId
    });
  } catch (error) {
    console.log('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// ============ ELIGIBILITY CRITERIA ROUTES ============

// Get all eligibility criteria
app.get("/make-server-324f6e20/criteria", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const criteria = await kv.getByPrefix('criteria:');
    const sortedCriteria = criteria.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return c.json(sortedCriteria);
  } catch (error) {
    console.log('Get criteria error:', error);
    return c.json({ error: 'Failed to get criteria' }, 500);
  }
});

// Add new criterion
app.post("/make-server-324f6e20/criteria", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const { text } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }
    
    const id = `criteria:${crypto.randomUUID()}`;
    const allCriteria = await kv.getByPrefix('criteria:');
    const maxOrder = allCriteria.reduce((max, c) => Math.max(max, c.order || 0), -1);
    
    const criterion = {
      id,
      text,
      enabled: true,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    
    await kv.set(id, criterion);
    
    return c.json(criterion);
  } catch (error) {
    console.log('Add criterion error:', error);
    return c.json({ error: 'Failed to add criterion' }, 500);
  }
});

// Update criterion
app.put("/make-server-324f6e20/criteria/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`criteria:${id}`);
    if (!existing) {
      return c.json({ error: 'Criterion not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };
    
    await kv.set(`criteria:${id}`, updated);
    
    return c.json(updated);
  } catch (error) {
    console.log('Update criterion error:', error);
    return c.json({ error: 'Failed to update criterion' }, 500);
  }
});

// Reorder criteria
app.post("/make-server-324f6e20/criteria/reorder", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const { criteriaIds } = await c.req.json();
    
    // Update order for each criterion
    const updates = criteriaIds.map(async (id: string, index: number) => {
      const existing = await kv.get(`criteria:${id}`);
      if (existing) {
        await kv.set(`criteria:${id}`, { ...existing, order: index });
      }
    });
    
    await Promise.all(updates);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Reorder criteria error:', error);
    return c.json({ error: 'Failed to reorder criteria' }, 500);
  }
});

// Delete criterion
app.delete("/make-server-324f6e20/criteria/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const id = c.req.param('id');
    await kv.del(`criteria:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete criterion error:', error);
    return c.json({ error: 'Failed to delete criterion' }, 500);
  }
});

// ============ APPLICATION ROUTES ============

// Submit application
app.post("/make-server-324f6e20/applications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const applicationData = await c.req.json();
    const id = `application:${crypto.randomUUID()}`;
    
    const application = {
      id,
      ...applicationData,
      applicantId: user.id,
      status: applicationData.isDraft ? 'draft' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, application);
    
    // Add to user's application list
    const userApps = await kv.get(`user:${user.id}:applications`) || [];
    await kv.set(`user:${user.id}:applications`, [...userApps, id]);
    
    return c.json(application);
  } catch (error) {
    console.log('Submit application error:', error);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Get user's applications
app.get("/make-server-324f6e20/applications/my", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const appIds = await kv.get(`user:${user.id}:applications`) || [];
    const applications = await kv.mget(appIds);
    
    return c.json(applications.filter(Boolean));
  } catch (error) {
    console.log('Get applications error:', error);
    return c.json({ error: 'Failed to get applications' }, 500);
  }
});

// Get all applications (admin only)
app.get("/make-server-324f6e20/applications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = [
      'SYSTEM_ADMIN', 'admin',
      'REBATE_ANALYST', 'analyst',
      'REBATE_MANAGER',
      'E_MOTO_PROGRAM_MANAGER',
      'DESIGNATED_FINANCE_OFFICER',
      'FINANCE_OFFICER', 'finance',
      'ASSET_FINANCIER_ADMIN',
      'CLAIMS_OFFICER',
      'ME_TEAM',
      'EXTERNAL_REVIEWER'
    ];
    
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const applications = await kv.getByPrefix('application:');
    
    return c.json(applications);
  } catch (error) {
    console.log('Get all applications error:', error);
    return c.json({ error: 'Failed to get applications' }, 500);
  }
});

// Update application
app.put("/make-server-324f6e20/applications/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = `application:${c.req.param('id')}`;
    const updates = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    // Check if user owns the application or is admin
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['SYSTEM_ADMIN', 'admin', 'REBATE_ANALYST', 'analyst', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 'ASSET_FINANCIER_ADMIN', 'DESIGNATED_FINANCE_OFFICER', 'FINANCE_OFFICER'];
    
    // Check if user has permission to update
    const hasRoleAccess = allowedRoles.includes(userProfile?.role);
    const isApplicant = existing.applicantId === user.id;
    const isFromSameOrganization = userProfile?.role === 'ASSET_FINANCIER_ADMIN' && existing.organizationId === userProfile?.organizationId;
    
    if (!isApplicant && !hasRoleAccess && !isFromSameOrganization) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, updated);
    
    return c.json(updated);
  } catch (error) {
    console.log('Update application error:', error);
    return c.json({ error: 'Failed to update application' }, 500);
  }
});

// Assign application to analyst
app.post("/make-server-324f6e20/applications/:id/assign", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['SYSTEM_ADMIN', 'admin', 'REBATE_MANAGER'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const id = `application:${c.req.param('id')}`;
    const { analystId } = await c.req.json();
    
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    const updated = {
      ...existing,
      assignedTo: analystId,
      assignedAt: new Date().toISOString(),
      assignedBy: user.id,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, updated);
    
    return c.json(updated);
  } catch (error) {
    console.log('Assign application error:', error);
    return c.json({ error: 'Failed to assign application' }, 500);
  }
});

// Upload document
app.post("/make-server-324f6e20/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const fileName = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from('make-324f6e20-documents')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      console.log('Upload error:', error);
      return c.json({ error: 'Upload failed' }, 500);
    }
    
    // Create signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from('make-324f6e20-documents')
      .createSignedUrl(fileName, 31536000);
    
    return c.json({
      path: data.path,
      url: signedUrlData?.signedUrl
    });
  } catch (error) {
    console.log('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-324f6e20/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['SYSTEM_ADMIN', 'admin', 'REBATE_MANAGER'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const users = await kv.getByPrefix('user:');
    // Filter out the application lists and only return actual user profiles
    const userProfiles = users.filter((u: any) => {
      // Must have an id field that doesn't contain ':applications'
      return u && u.id && typeof u.id === 'string' && !u.id.includes(':applications');
    });
    
    return c.json(userProfiles);
  } catch (error) {
    console.log('Get users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

// Toggle user status (activate/deactivate)
app.post("/make-server-324f6e20/users/:userId/toggle-status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['SYSTEM_ADMIN', 'admin', 'REBATE_MANAGER'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const { userId } = c.req.param();
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Toggle the isActive status
    const newStatus = targetUser.isActive === false ? true : false;
    
    await kv.set(`user:${userId}`, {
      ...targetUser,
      isActive: newStatus,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`User ${userId} status toggled to ${newStatus ? 'active' : 'inactive'}`);
    return c.json({ success: true, isActive: newStatus });
  } catch (error) {
    console.log('Toggle user status error:', error);
    return c.json({ error: 'Failed to toggle user status' }, 500);
  }
});

// ============ EVALUATION ROUTES ============

// Save evaluation progress
app.post("/make-server-324f6e20/evaluations", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['REBATE_ANALYST', 'analyst', 'REBATE_MANAGER'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Analyst or Manager access required' }, 403);
    }
    
    const { applicationId, criteriaEvaluations, notes, score } = await c.req.json();
    
    // Store evaluations separately by role: evaluation:analyst:appId or evaluation:manager:appId
    const evaluatorRole = userProfile.role === 'REBATE_MANAGER' ? 'manager' : 'analyst';
    const evaluationId = `evaluation:${evaluatorRole}:${applicationId}`;
    const evaluation = {
      id: evaluationId,
      applicationId,
      evaluatorId: user.id,
      evaluatorRole: evaluatorRole,
      criteriaEvaluations,
      notes,
      score,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await kv.set(evaluationId, evaluation);
    
    // Update application status if it's pending or assigned
    const app = await kv.get(applicationId);
    if (app && ['pending', 'assigned'].includes(app.status)) {
      await kv.set(applicationId, {
        ...app,
        status: 'under-review',
        updatedAt: new Date().toISOString()
      });
    }
    
    return c.json(evaluation);
  } catch (error) {
    console.log('Save evaluation error:', error);
    return c.json({ error: 'Failed to save evaluation' }, 500);
  }
});

// Get evaluation for application (by role)
app.get("/make-server-324f6e20/evaluations/:applicationId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const applicationId = `application:${c.req.param('applicationId')}`;
    
    // Get the evaluation based on user's role
    const evaluatorRole = userProfile.role === 'REBATE_MANAGER' ? 'manager' : 'analyst';
    const evaluationId = `evaluation:${evaluatorRole}:${applicationId}`;
    
    const evaluation = await kv.get(evaluationId);
    
    return c.json(evaluation || null);
  } catch (error) {
    console.log('Get evaluation error:', error);
    return c.json({ error: 'Failed to get evaluation' }, 500);
  }
});

// Get BOTH analyst and QA evaluations (for CFO transparency view)
app.get("/make-server-324f6e20/evaluations/:applicationId/all", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const applicationId = `application:${c.req.param('applicationId')}`;
    
    // Get both analyst and QA evaluations
    const analystEvaluation = await kv.get(`evaluation:analyst:${applicationId}`);
    const qaEvaluation = await kv.get(`evaluation:qa:${applicationId}`);
    
    return c.json({
      analyst: analystEvaluation || null,
      qa: qaEvaluation || null
    });
  } catch (error) {
    console.log('Get all evaluations error:', error);
    return c.json({ error: 'Failed to get evaluations' }, 500);
  }
});

// Complete evaluation (approve/reject)
app.post("/make-server-324f6e20/evaluations/:applicationId/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['REBATE_ANALYST', 'analyst', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Reviewer access required' }, 403);
    }
    
    const { decision, notes, criteriaEvaluations, score } = await c.req.json();
    const applicationId = `application:${c.req.param('applicationId')}`;
    
    // Store evaluation separately by role
    const evaluatorRole = userProfile.role === 'REBATE_MANAGER' ? 'manager' : 
                          userProfile.role === 'E_MOTO_PROGRAM_MANAGER' ? 'program-manager' : 'analyst';
    const evaluationId = `evaluation:${evaluatorRole}:${applicationId}`;
    
    // Update evaluation with final decision
    const evaluation = await kv.get(evaluationId) || {};
    const completedEvaluation = {
      ...evaluation,
      id: evaluationId,
      applicationId,
      evaluatorId: user.id,
      evaluatorRole: evaluatorRole,
      criteriaEvaluations,
      notes,
      score,
      decision,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(evaluationId, completedEvaluation);
    
    // Update application status based on role and decision
    const app = await kv.get(applicationId);
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    let newStatus = app.status;
    
    if (userProfile.role === 'analyst' || userProfile.role === 'REBATE_ANALYST') {
      if (decision === 'approve') {
        newStatus = 'manager-review';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      }
    } else if (userProfile.role === 'qa' || userProfile.role === 'REBATE_MANAGER') {
      if (decision === 'approve') {
        newStatus = 'program-manager-review';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      } else if (decision === 'send-back') {
        newStatus = 'assigned';
      }
    } else if (userProfile.role === 'E_MOTO_PROGRAM_MANAGER') {
      if (decision === 'approve') {
        newStatus = 'approved-pending-lease';
      } else if (decision === 'reject') {
        newStatus = 'rejected';
      }
    }
    
    await kv.set(applicationId, {
      ...app,
      status: newStatus,
      lastReviewedBy: user.id,
      lastReviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, evaluation: completedEvaluation });
  } catch (error) {
    console.log('Complete evaluation error:', error);
    return c.json({ error: 'Failed to complete evaluation' }, 500);
  }
});

// Request clarification from Asset Financier (Analyst only)
app.post("/make-server-324f6e20/applications/:id/request-clarification", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'analyst') {
      return c.json({ error: 'Analyst access required' }, 403);
    }
    
    const { message, criteriaNeeded } = await c.req.json();
    const applicationId = `application:${c.req.param('id')}`;
    
    const app = await kv.get(applicationId);
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    // Create clarification request
    const clarificationId = `clarification:${applicationId}:${Date.now()}`;
    const clarification = {
      id: clarificationId,
      applicationId,
      requestedBy: user.id,
      requestedByName: userProfile.name,
      requestedAt: new Date().toISOString(),
      message,
      criteriaNeeded: criteriaNeeded || [],
      status: 'pending',
      response: null,
      respondedAt: null
    };
    
    await kv.set(clarificationId, clarification);
    
    // Update application status to clarification-needed
    await kv.set(applicationId, {
      ...app,
      status: 'clarification-needed',
      clarificationRequestId: clarificationId,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, clarification });
  } catch (error) {
    console.log('Request clarification error:', error);
    return c.json({ error: 'Failed to request clarification' }, 500);
  }
});

// Get clarifications for an application
app.get("/make-server-324f6e20/applications/:id/clarifications", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const applicationId = `application:${c.req.param('id')}`;
    const clarifications = await kv.getByPrefix(`clarification:${applicationId}:`);
    
    // Sort by requested date (newest first)
    const sorted = clarifications.sort((a: any, b: any) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
    
    return c.json(sorted);
  } catch (error) {
    console.log('Get clarifications error:', error);
    return c.json({ error: 'Failed to get clarifications' }, 500);
  }
});

// Respond to clarification request (Asset Financier)
app.post("/make-server-324f6e20/clarifications/:id/respond", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'applicant') {
      return c.json({ error: 'Asset Financier access required' }, 403);
    }
    
    const clarificationId = c.req.param('id');
    const { response, updatedDocuments } = await c.req.json();
    
    const clarification = await kv.get(clarificationId);
    if (!clarification) {
      return c.json({ error: 'Clarification not found' }, 404);
    }
    
    // Update clarification with response
    const updatedClarification = {
      ...clarification,
      response,
      updatedDocuments: updatedDocuments || [],
      respondedAt: new Date().toISOString(),
      respondedBy: user.id,
      respondedByName: userProfile.name,
      status: 'responded'
    };
    
    await kv.set(clarificationId, updatedClarification);
    
    // Update application status back to assigned for analyst review
    const applicationId = clarification.applicationId;
    const app = await kv.get(applicationId);
    if (app) {
      await kv.set(applicationId, {
        ...app,
        status: 'assigned',
        clarificationRespondedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return c.json({ success: true, clarification: updatedClarification });
  } catch (error) {
    console.log('Respond to clarification error:', error);
    return c.json({ error: 'Failed to respond to clarification' }, 500);
  }
});

// Flag application for CFO attention
app.post("/make-server-324f6e20/applications/:id/flag", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'qa') {
      return c.json({ error: 'QA access required' }, 403);
    }
    
    const { flagReason } = await c.req.json();
    const applicationId = `application:${c.req.param('id')}`;
    
    const app = await kv.get(applicationId);
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    await kv.set(applicationId, {
      ...app,
      flaggedForCFO: true,
      flagReason,
      flaggedBy: user.id,
      flaggedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Flag application error:', error);
    return c.json({ error: 'Failed to flag application' }, 500);
  }
});

// ============ ELIGIBILITY CHECK ROUTES ============

// Save eligibility check for an application
app.post("/make-server-324f6e20/analyst/eligibility-check/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['REBATE_ANALYST', 'analyst'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Analyst access required' }, 403);
    }
    
    const applicationId = `application:${c.req.param('id')}`;
    const eligibilityData = await c.req.json();
    
    // Get the application
    const app = await kv.get(applicationId);
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    // Prepare eligibility check data with metadata
    const eligibilityCheck = {
      ...eligibilityData,
      performedBy: user.id,
      performedByName: userProfile.name,
      performedAt: new Date().toISOString()
    };
    
    // Update the application with eligibility check data
    await kv.set(applicationId, {
      ...app,
      eligibilityCheck,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, eligibilityCheck });
  } catch (error) {
    console.log('Save eligibility check error:', error);
    return c.json({ error: 'Failed to save eligibility check' }, 500);
  }
});

// Get eligibility check for an application
app.get("/make-server-324f6e20/analyst/eligibility-check/:id", async (c) => {
  try {
    const applicationId = `application:${c.req.param('id')}`;
    const app = await kv.get(applicationId);
    
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    // Return eligibility check data if exists, otherwise default structure
    const eligibilityCheck = app.eligibilityCheck || {
      overallStatus: 'not-checked',
      socialRegistryCheck: { status: 'pending' },
      ruraRraCheck: { status: 'pending' },
      nationalIdCheck: { status: 'pending' },
      taxiLicenseCheck: { status: 'pending' }
    };
    
    return c.json(eligibilityCheck);
  } catch (error) {
    console.log('Get eligibility check error:', error);
    return c.json({ error: 'Failed to get eligibility check' }, 500);
  }
});

// ============ CFO ROUTES ============

// CFO approve/reject application
app.post("/make-server-324f6e20/cfo/applications/:id/decision", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'cfo') {
      return c.json({ error: 'CFO access required' }, 403);
    }
    
    const { decision, notes } = await c.req.json();
    const applicationId = `application:${c.req.param('id')}`;
    
    const app = await kv.get(applicationId);
    if (!app) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    
    await kv.set(applicationId, {
      ...app,
      status: newStatus,
      cfoDecision: decision,
      cfoNotes: notes,
      cfoApprovedBy: user.id,
      cfoApprovedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('CFO decision error:', error);
    return c.json({ error: 'Failed to process decision' }, 500);
  }
});

// CFO batch approve applications
app.post("/make-server-324f6e20/cfo/batch-approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'cfo') {
      return c.json({ error: 'CFO access required' }, 403);
    }
    
    const { applicationIds, notes } = await c.req.json();
    
    const updates = applicationIds.map(async (id: string) => {
      const applicationId = `application:${id}`;
      const app = await kv.get(applicationId);
      if (app) {
        await kv.set(applicationId, {
          ...app,
          status: 'approved',
          cfoDecision: 'approve',
          cfoNotes: notes,
          cfoApprovedBy: user.id,
          cfoApprovedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    await Promise.all(updates);
    
    return c.json({ success: true, count: applicationIds.length });
  } catch (error) {
    console.log('Batch approve error:', error);
    return c.json({ error: 'Failed to batch approve' }, 500);
  }
});

// ============ DISBURSEMENT ROUTES ============

// Record disbursement
app.post("/make-server-324f6e20/disbursements", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (userProfile?.role !== 'finance') {
      return c.json({ error: 'Finance access required' }, 403);
    }
    
    const { applicationId, amount, referenceNumber, bankDetails, status, failureReason } = await c.req.json();
    
    const disbursementId = `disbursement:${applicationId}`;
    const disbursement = {
      id: disbursementId,
      applicationId,
      amount,
      referenceNumber,
      bankDetails,
      status,
      failureReason,
      processedBy: user.id,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await kv.set(disbursementId, disbursement);
    
    // Update application status
    const appId = `application:${applicationId}`;
    const app = await kv.get(appId);
    if (app) {
      await kv.set(appId, {
        ...app,
        status: status === 'success' ? 'disbursed' : 'disbursement-failed',
        updatedAt: new Date().toISOString()
      });
    }
    
    return c.json(disbursement);
  } catch (error) {
    console.log('Record disbursement error:', error);
    return c.json({ error: 'Failed to record disbursement' }, 500);
  }
});

// Get disbursement by application
app.get("/make-server-324f6e20/disbursements/:applicationId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const applicationId = c.req.param('applicationId');
    const disbursementId = `disbursement:application:${applicationId}`;
    
    const disbursement = await kv.get(disbursementId);
    
    return c.json(disbursement || null);
  } catch (error) {
    console.log('Get disbursement error:', error);
    return c.json({ error: 'Failed to get disbursement' }, 500);
  }
});

// Get all disbursements
app.get("/make-server-324f6e20/disbursements", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['DESIGNATED_FINANCE_OFFICER', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 'SYSTEM_ADMIN', 'admin'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    const disbursements = await kv.getByPrefix('disbursement:');
    
    return c.json(disbursements);
  } catch (error) {
    console.log('Get disbursements error:', error);
    return c.json({ error: 'Failed to get disbursements' }, 500);
  }
});

// ============ FINANCE WORKFLOW ROUTES (Two-Signature System) ============

// Get applications ready for Finance Initiation (QA Approved)
app.get("/make-server-324f6e20/finance/pending-initiation", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    // Check if user has initiate_payment permission
    if (!userProfile?.permissions?.includes('financial.initiate_payment')) {
      return c.json({ error: 'Initiate payment permission required' }, 403);
    }
    
    const applications = await kv.getByPrefix('application:');
    // Filter for QA-approved applications ready for finance initiation
    const pendingInitiation = applications.filter((app: any) => 
      app.status === 'qa-approved' || app.status === 'cfo-approved'
    );
    
    return c.json(pendingInitiation);
  } catch (error) {
    console.log('Get pending initiation error:', error);
    return c.json({ error: 'Failed to get pending initiation applications' }, 500);
  }
});

// Initiate Disbursement (First Signature - Finance Officer)
app.post("/make-server-324f6e20/finance/initiate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    // Check if user has initiate_payment permission
    if (!userProfile?.permissions?.includes('financial.initiate_payment')) {
      return c.json({ error: 'Initiate payment permission required' }, 403);
    }
    
    const { applicationIds, notes } = await c.req.json();
    
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return c.json({ error: 'Application IDs are required' }, 400);
    }
    
    const timestamp = new Date().toISOString();
    const results = [];
    let totalAmount = 0;
    
    // Process each application
    for (const appId of applicationIds) {
      // Handle both prefixed and non-prefixed IDs
      const normalizedId = appId.startsWith('application:') ? appId : `application:${appId}`;
      const application = await kv.get(normalizedId);
      
      if (!application) {
        return c.json({ error: `Application ${appId} not found` }, 404);
      }
      
      if (application.status !== 'qa-approved' && application.status !== 'cfo-approved') {
        return c.json({ error: `Application ${appId} is not ready for initiation` }, 400);
      }
      
      // Calculate total for weekly limit check
      const rebateAmount = parseFloat(application.rebateAmount) || 0;
      totalAmount += rebateAmount;
      
      // Create initiation record
      const initiationId = `finance_initiation:${crypto.randomUUID()}`;
      const initiation = {
        id: initiationId,
        applicationId: normalizedId,
        initiatedBy: user.id,
        initiatorName: userProfile.name,
        initiatorEmail: userProfile.email,
        initiatedAt: timestamp,
        amount: application.rebateAmount,
        notes: notes || '',
        signature: `INIT_${user.id}_${timestamp}` // Digital signature
      };
      
      await kv.set(initiationId, initiation);
      
      // Update application status
      await kv.set(normalizedId, {
        ...application,
        status: 'awaiting-final-approval',
        financeInitiationId: initiationId,
        initiatedBy: user.id,
        initiatedAt: timestamp,
        updatedAt: timestamp
      });
      
      // Create audit log
      const auditId = `audit:${crypto.randomUUID()}`;
      await kv.set(auditId, {
        id: auditId,
        timestamp,
        userId: user.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        action: 'FINANCE_INITIATION',
        resourceType: 'APPLICATION',
        resourceId: normalizedId,
        details: `Disbursement initiated for application ${normalizedId}. Amount: ${application.rebateAmount}`,
        metadata: { initiationId, notes }
      });
      
      results.push({ applicationId: normalizedId, status: 'initiated', initiationId });
    }
    
    // Check weekly limit (EUR 10,000 = approximately 10,000,000 in local currency)
    const weeklyLimit = 10000000; // Adjust based on currency
    let requiresExceptionApproval = false;
    
    if (totalAmount > weeklyLimit) {
      requiresExceptionApproval = true;
    }
    
    return c.json({ 
      success: true, 
      results, 
      totalAmount,
      requiresExceptionApproval,
      message: requiresExceptionApproval 
        ? 'Disbursement initiated. Exception approval required - weekly limit exceeded.'
        : 'Disbursement initiated successfully. Awaiting final approval.'
    });
  } catch (error) {
    console.log('Initiate disbursement error:', error);
    return c.json({ error: 'Failed to initiate disbursement' }, 500);
  }
});

// Get applications pending final approval (Initiated, awaiting CFO signature)
app.get("/make-server-324f6e20/finance/pending-approval", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    // Check if user has authorize_payment permission
    if (!userProfile?.permissions?.includes('financial.authorize_payment')) {
      return c.json({ error: 'Authorize payment permission required' }, 403);
    }
    
    const applications = await kv.getByPrefix('application:');
    const pendingApproval = applications.filter((app: any) => 
      app.status === 'awaiting-final-approval'
    );
    
    // Fetch initiation details for each application
    const enrichedApps = await Promise.all(
      pendingApproval.map(async (app: any) => {
        if (app.financeInitiationId) {
          const initiation = await kv.get(app.financeInitiationId);
          return { ...app, initiationDetails: initiation };
        }
        return app;
      })
    );
    
    return c.json(enrichedApps);
  } catch (error) {
    console.log('Get pending approval error:', error);
    return c.json({ error: 'Failed to get pending approval applications' }, 500);
  }
});

// Approve Disbursement (Second Signature - CFO/Approver)
app.post("/make-server-324f6e20/finance/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    // Check if user has authorize_payment permission
    if (!userProfile?.permissions?.includes('financial.authorize_payment')) {
      return c.json({ error: 'Authorize payment permission required' }, 403);
    }
    
    const { applicationId, notes } = await c.req.json();
    
    if (!applicationId) {
      return c.json({ error: 'Application ID is required' }, 400);
    }
    
    // Handle both prefixed and non-prefixed IDs
    const normalizedId = applicationId.startsWith('application:') ? applicationId : `application:${applicationId}`;
    const application = await kv.get(normalizedId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    if (application.status !== 'awaiting-final-approval') {
      return c.json({ error: 'Application is not awaiting final approval' }, 400);
    }
    
    // CRITICAL: Two-person control - check that approver is not the same as initiator
    if (application.initiatedBy === user.id) {
      return c.json({ 
        error: 'Security Violation: You cannot approve a disbursement that you initiated',
        code: 'SAME_USER_VIOLATION'
      }, 403);
    }
    
    const timestamp = new Date().toISOString();
    
    // Create approval record
    const approvalId = `finance_approval:${crypto.randomUUID()}`;
    const approval = {
      id: approvalId,
      applicationId: normalizedId,
      approvedBy: user.id,
      approverName: userProfile.name,
      approverEmail: userProfile.email,
      approvedAt: timestamp,
      amount: application.rebateAmount,
      notes: notes || '',
      signature: `APPR_${user.id}_${timestamp}` // Digital signature
    };
    
    await kv.set(approvalId, approval);
    
    // Create payment record
    const paymentId = `payment:${crypto.randomUUID()}`;
    const payment = {
      id: paymentId,
      applicationId: normalizedId,
      amount: application.rebateAmount,
      initiationId: application.financeInitiationId,
      approvalId,
      status: 'approved-for-payment',
      createdAt: timestamp
    };
    
    await kv.set(paymentId, payment);
    
    // Update application status
    await kv.set(normalizedId, {
      ...application,
      status: 'approved-for-payment',
      financeApprovalId: approvalId,
      paymentId,
      approvedBy: user.id,
      approvedAt: timestamp,
      approvalNotes: notes,
      updatedAt: timestamp
    });
    
    // Create audit log
    const auditId = `audit:${crypto.randomUUID()}`;
    await kv.set(auditId, {
      id: auditId,
      timestamp,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      action: 'FINANCE_APPROVAL',
      resourceType: 'APPLICATION',
      resourceId: normalizedId,
      details: `Disbursement approved for application ${normalizedId}. Amount: ${application.rebateAmount}. Two-signature verification completed.`,
      metadata: { approvalId, paymentId, notes }
    });
    
    return c.json({ 
      success: true, 
      approvalId, 
      paymentId,
      message: 'Disbursement approved successfully. Payment record created.' 
    });
  } catch (error) {
    console.log('Approve disbursement error:', error);
    return c.json({ error: 'Failed to approve disbursement' }, 500);
  }
});

// Reject Disbursement (CFO/Approver)
app.post("/make-server-324f6e20/finance/reject", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.permissions?.includes('financial.authorize_payment')) {
      return c.json({ error: 'Authorize payment permission required' }, 403);
    }
    
    const { applicationId, reason } = await c.req.json();
    
    if (!applicationId || !reason) {
      return c.json({ error: 'Application ID and rejection reason are required' }, 400);
    }
    
    // Handle both prefixed and non-prefixed IDs
    const normalizedId = applicationId.startsWith('application:') ? applicationId : `application:${applicationId}`;
    const application = await kv.get(normalizedId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    if (application.status !== 'awaiting-final-approval') {
      return c.json({ error: 'Application is not awaiting final approval' }, 400);
    }
    
    const timestamp = new Date().toISOString();
    
    // Update application status
    await kv.set(normalizedId, {
      ...application,
      status: 'finance-rejected',
      rejectedBy: user.id,
      rejectedAt: timestamp,
      rejectionReason: reason,
      updatedAt: timestamp
    });
    
    // Create audit log
    const auditId = `audit:${crypto.randomUUID()}`;
    await kv.set(auditId, {
      id: auditId,
      timestamp,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      action: 'FINANCE_REJECTION',
      resourceType: 'APPLICATION',
      resourceId: normalizedId,
      details: `Disbursement rejected for application ${normalizedId}. Reason: ${reason}`,
      metadata: { reason }
    });
    
    return c.json({ success: true, message: 'Disbursement rejected' });
  } catch (error) {
    console.log('Reject disbursement error:', error);
    return c.json({ error: 'Failed to reject disbursement' }, 500);
  }
});

// Get applications approved for payment processing
app.get("/make-server-324f6e20/finance/pending-payment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['DESIGNATED_FINANCE_OFFICER', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 'SYSTEM_ADMIN'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Finance access required' }, 403);
    }
    
    const applications = await kv.getByPrefix('application:');
    const pendingPayment = applications.filter((app: any) => 
      app.status === 'approved-for-payment'
    );
    
    // Enrich with payment details
    const enrichedApps = await Promise.all(
      pendingPayment.map(async (app: any) => {
        if (app.paymentId) {
          const payment = await kv.get(app.paymentId);
          return { ...app, paymentDetails: payment };
        }
        return app;
      })
    );
    
    return c.json(enrichedApps);
  } catch (error) {
    console.log('Get pending payment error:', error);
    return c.json({ error: 'Failed to get pending payment applications' }, 500);
  }
});

// Process Payment (Update payment status)
app.post("/make-server-324f6e20/finance/process-payment", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['DESIGNATED_FINANCE_OFFICER', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 'SYSTEM_ADMIN'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Finance access required' }, 403);
    }
    
    const { applicationId, paymentStatus, referenceNumber, bankTransactionId, notes } = await c.req.json();
    
    if (!applicationId || !paymentStatus) {
      return c.json({ error: 'Application ID and payment status are required' }, 400);
    }
    
    // Handle both prefixed and non-prefixed IDs
    const normalizedId = applicationId.startsWith('application:') ? applicationId : `application:${applicationId}`;
    const application = await kv.get(normalizedId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    // Prevent duplicate payment
    if (application.status === 'funded' || application.status === 'payment-processed') {
      return c.json({ error: 'Payment already processed for this application' }, 400);
    }
    
    const timestamp = new Date().toISOString();
    
    // Update payment record
    if (application.paymentId) {
      const payment = await kv.get(application.paymentId);
      await kv.set(application.paymentId, {
        ...payment,
        status: paymentStatus,
        referenceNumber,
        bankTransactionId,
        processedBy: user.id,
        processedAt: timestamp,
        notes
      });
    }
    
    // Update application status based on payment status
    let newStatus = application.status;
    if (paymentStatus === 'initiated' || paymentStatus === 'pending') {
      newStatus = 'payment-initiated';
    } else if (paymentStatus === 'processed' || paymentStatus === 'cleared') {
      newStatus = 'payment-processed';
    } else if (paymentStatus === 'failed' || paymentStatus === 'rejected') {
      newStatus = 'payment-failed';
    }
    
    await kv.set(normalizedId, {
      ...application,
      status: newStatus,
      paymentStatus,
      paymentReferenceNumber: referenceNumber,
      bankTransactionId,
      paymentProcessedBy: user.id,
      paymentProcessedAt: timestamp,
      updatedAt: timestamp
    });
    
    // Create audit log
    const auditId = `audit:${crypto.randomUUID()}`;
    await kv.set(auditId, {
      id: auditId,
      timestamp,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      action: 'PAYMENT_PROCESSING',
      resourceType: 'APPLICATION',
      resourceId: normalizedId,
      details: `Payment ${paymentStatus} for application ${normalizedId}. Reference: ${referenceNumber || 'N/A'}`,
      metadata: { paymentStatus, referenceNumber, bankTransactionId, notes }
    });
    
    return c.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.log('Process payment error:', error);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

// Upload Proof of Payment
app.post("/make-server-324f6e20/finance/upload-proof", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['DESIGNATED_FINANCE_OFFICER', 'REBATE_MANAGER', 'E_MOTO_PROGRAM_MANAGER', 'SYSTEM_ADMIN'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Finance access required' }, 403);
    }
    
    const { applicationId, proofOfPaymentUrl, transactionId } = await c.req.json();
    
    if (!applicationId || !proofOfPaymentUrl) {
      return c.json({ error: 'Application ID and proof of payment are required' }, 400);
    }
    
    // Handle both prefixed and non-prefixed IDs
    const normalizedId = applicationId.startsWith('application:') ? applicationId : `application:${applicationId}`;
    const application = await kv.get(normalizedId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    const timestamp = new Date().toISOString();
    
    // Update payment record
    if (application.paymentId) {
      const payment = await kv.get(application.paymentId);
      await kv.set(application.paymentId, {
        ...payment,
        proofOfPaymentUrl,
        fundedAt: timestamp
      });
    }
    
    // Update application to FUNDED status
    await kv.set(normalizedId, {
      ...application,
      status: 'funded',
      proofOfPaymentUrl,
      fundedAt: timestamp,
      updatedAt: timestamp
    });
    
    // Create audit log
    const auditId = `audit:${crypto.randomUUID()}`;
    await kv.set(auditId, {
      id: auditId,
      timestamp,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      action: 'PROOF_OF_PAYMENT_UPLOADED',
      resourceType: 'APPLICATION',
      resourceId: normalizedId,
      details: `Proof of payment uploaded for application ${normalizedId}. Status updated to FUNDED.`,
      metadata: { proofOfPaymentUrl, transactionId }
    });
    
    // TODO: Notify Asset Financier that funds have been transferred
    
    return c.json({ success: true, message: 'Proof of payment uploaded. Application status updated to FUNDED.' });
  } catch (error) {
    console.log('Upload proof error:', error);
    return c.json({ error: 'Failed to upload proof of payment' }, 500);
  }
});

// Get applications awaiting delivery confirmation
app.get("/make-server-324f6e20/delivery/pending", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    
    // Get applications that are funded and belong to user's organization
    const applications = await kv.getByPrefix('application:');
    let pendingDelivery = applications.filter((app: any) => 
      app.status === 'funded'
    );
    
    // If user is Asset Financier, filter by organization
    if (userProfile?.role === 'ASSET_FINANCIER_ADMIN' || userProfile?.role === 'CLAIMS_OFFICER') {
      pendingDelivery = pendingDelivery.filter((app: any) => 
        app.organizationId === userProfile.organizationId
      );
    }
    
    return c.json(pendingDelivery);
  } catch (error) {
    console.log('Get pending delivery error:', error);
    return c.json({ error: 'Failed to get pending delivery applications' }, 500);
  }
});

// Confirm Delivery
app.post("/make-server-324f6e20/delivery/confirm", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    const allowedRoles = ['ASSET_FINANCIER_ADMIN', 'CLAIMS_OFFICER', 'SYSTEM_ADMIN'];
    if (!allowedRoles.includes(userProfile?.role)) {
      return c.json({ error: 'Asset Financier access required' }, 403);
    }
    
    const { applicationId, handoverReceiptUrl, geotaggedPhotoUrl, deliveryNotes } = await c.req.json();
    
    if (!applicationId || !handoverReceiptUrl || !geotaggedPhotoUrl) {
      return c.json({ error: 'Application ID, handover receipt, and geotagged photo are required' }, 400);
    }
    
    // Handle both prefixed and non-prefixed IDs
    const normalizedId = applicationId.startsWith('application:') ? applicationId : `application:${applicationId}`;
    const application = await kv.get(normalizedId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }
    
    if (application.status !== 'funded') {
      return c.json({ error: 'Application must be in FUNDED status to confirm delivery' }, 400);
    }
    
    // Verify the application belongs to the user's organization
    if (userProfile.role !== 'SYSTEM_ADMIN' && application.organizationId !== userProfile.organizationId) {
      return c.json({ error: 'You can only confirm delivery for your organization' }, 403);
    }
    
    const timestamp = new Date().toISOString();
    
    // Create delivery record
    const deliveryId = `delivery:${crypto.randomUUID()}`;
    const delivery = {
      id: deliveryId,
      applicationId: normalizedId,
      handoverReceiptUrl,
      geotaggedPhotoUrl,
      deliveryNotes,
      confirmedBy: user.id,
      confirmerName: userProfile.name,
      confirmedAt: timestamp,
      createdAt: timestamp
    };
    
    await kv.set(deliveryId, delivery);
    
    // Update application to COMPLETED status
    await kv.set(normalizedId, {
      ...application,
      status: 'completed',
      deliveryId,
      deliveryConfirmedBy: user.id,
      deliveryConfirmedAt: timestamp,
      handoverReceiptUrl,
      geotaggedPhotoUrl,
      deliveryNotes,
      completedAt: timestamp,
      updatedAt: timestamp
    });
    
    // Create audit log
    const auditId = `audit:${crypto.randomUUID()}`;
    await kv.set(auditId, {
      id: auditId,
      timestamp,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      action: 'DELIVERY_CONFIRMED',
      resourceType: 'APPLICATION',
      resourceId: normalizedId,
      details: `E-moto delivery confirmed for application ${normalizedId}. Application completed.`,
      metadata: { deliveryId, handoverReceiptUrl, geotaggedPhotoUrl, deliveryNotes }
    });
    
    return c.json({ 
      success: true, 
      deliveryId,
      message: 'Delivery confirmed successfully. Application completed.' 
    });
  } catch (error) {
    console.log('Confirm delivery error:', error);
    return c.json({ error: 'Failed to confirm delivery' }, 500);
  }
});

// ============ ROLE MANAGEMENT ROUTES ============

// Helper function to create audit log
const createAuditLog = async (log: any) => {
  const auditId = `audit:${crypto.randomUUID()}`;
  await kv.set(auditId, {
    id: auditId,
    ...log,
    timestamp: new Date().toISOString()
  });
};

// Get all roles
app.get("/make-server-324f6e20/roles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const roles = await kv.getByPrefix('role:');
    return c.json(roles);
  } catch (error) {
    console.log('Get roles error:', error);
    return c.json({ error: 'Failed to get roles' }, 500);
  }
});

// Create role
app.post("/make-server-324f6e20/roles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const { name, code, description, permissions } = await c.req.json();
    
    if (!name || !code) {
      return c.json({ error: 'Name and code are required' }, 400);
    }
    
    const roleId = `role:${code}`;
    
    // Check if role already exists
    const existing = await kv.get(roleId);
    if (existing) {
      return c.json({ error: 'Role with this code already exists' }, 400);
    }
    
    const role = {
      id: roleId,
      name,
      code,
      description,
      isActive: true,
      permissions: permissions || [],
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    
    await kv.set(roleId, role);
    
    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'ROLE',
      entityId: roleId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { roleName: name, roleCode: code }
    });
    
    return c.json(role);
  } catch (error) {
    console.log('Create role error:', error);
    return c.json({ error: 'Failed to create role' }, 500);
  }
});

// Update role
app.put("/make-server-324f6e20/roles/:code", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const code = c.req.param('code');
    const updates = await c.req.json();
    
    const roleId = `role:${code}`;
    const existing = await kv.get(roleId);
    
    if (!existing) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };
    
    await kv.set(roleId, updated);
    
    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      entityType: 'ROLE',
      entityId: roleId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      changes: { before: existing, after: updated }
    });
    
    return c.json(updated);
  } catch (error) {
    console.log('Update role error:', error);
    return c.json({ error: 'Failed to update role' }, 500);
  }
});

// Toggle role status
app.post("/make-server-324f6e20/roles/:code/toggle-status", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const code = c.req.param('code');
    const roleId = `role:${code}`;
    const existing = await kv.get(roleId);
    
    if (!existing) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    const updated = {
      ...existing,
      isActive: !existing.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };
    
    await kv.set(roleId, updated);
    
    // Audit log
    await createAuditLog({
      action: updated.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'ROLE',
      entityId: roleId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { roleName: existing.name }
    });
    
    return c.json(updated);
  } catch (error) {
    console.log('Toggle role status error:', error);
    return c.json({ error: 'Failed to toggle role status' }, 500);
  }
});

// Delete role
app.delete("/make-server-324f6e20/roles/:code", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const code = c.req.param('code');
    const roleId = `role:${code}`;
    const existing = await kv.get(roleId);
    
    if (!existing) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    await kv.del(roleId);
    
    // Audit log
    await createAuditLog({
      action: 'DELETE',
      entityType: 'ROLE',
      entityId: roleId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { roleName: existing.name }
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete role error:', error);
    return c.json({ error: 'Failed to delete role' }, 500);
  }
});

// ============ PERMISSION MANAGEMENT ROUTES ============

// Get all permissions
app.get("/make-server-324f6e20/permissions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const permissions = await kv.getByPrefix('permission:');
    return c.json(permissions);
  } catch (error) {
    console.log('Get permissions error:', error);
    return c.json({ error: 'Failed to get permissions' }, 500);
  }
});

// Create permission
app.post("/make-server-324f6e20/permissions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const { name, code, description, category, action } = await c.req.json();
    
    if (!name || !code || !category || !action) {
      return c.json({ error: 'Name, code, category, and action are required' }, 400);
    }
    
    const permissionId = `permission:${code}`;
    
    const permission = {
      id: permissionId,
      name,
      code,
      description,
      category,
      action,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(permissionId, permission);
    
    // Audit log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'PERMISSION',
      entityId: permissionId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { permissionName: name, permissionCode: code }
    });
    
    return c.json(permission);
  } catch (error) {
    console.log('Create permission error:', error);
    return c.json({ error: 'Failed to create permission' }, 500);
  }
});

// Assign permission to role
app.post("/make-server-324f6e20/roles/:code/permissions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const code = c.req.param('code');
    const { permissionCode } = await c.req.json();
    
    const roleId = `role:${code}`;
    const role = await kv.get(roleId);
    
    if (!role) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    const permissionId = `permission:${permissionCode}`;
    
    if (!role.permissions.includes(permissionId)) {
      role.permissions.push(permissionId);
      role.updatedAt = new Date().toISOString();
      role.updatedBy = user.id;
      
      await kv.set(roleId, role);
      
      // Audit log
      await createAuditLog({
        action: 'ASSIGN',
        entityType: 'PERMISSION',
        entityId: permissionId,
        userId: user.id,
        userName: userProfile.name,
        userRole: userProfile.role,
        metadata: { roleName: role.name, permissionCode }
      });
    }
    
    return c.json(role);
  } catch (error) {
    console.log('Assign permission error:', error);
    return c.json({ error: 'Failed to assign permission' }, 500);
  }
});

// Remove permission from role
app.delete("/make-server-324f6e20/roles/:code/permissions/:permissionCode", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const code = c.req.param('code');
    const permissionCode = c.req.param('permissionCode');
    
    const roleId = `role:${code}`;
    const role = await kv.get(roleId);
    
    if (!role) {
      return c.json({ error: 'Role not found' }, 404);
    }
    
    const permissionId = `permission:${permissionCode}`;
    role.permissions = role.permissions.filter((p: string) => p !== permissionId);
    role.updatedAt = new Date().toISOString();
    role.updatedBy = user.id;
    
    await kv.set(roleId, role);
    
    // Audit log
    await createAuditLog({
      action: 'REVOKE',
      entityType: 'PERMISSION',
      entityId: permissionId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { roleName: role.name, permissionCode }
    });
    
    return c.json(role);
  } catch (error) {
    console.log('Remove permission error:', error);
    return c.json({ error: 'Failed to remove permission' }, 500);
  }
});

// Grant permission to individual user
app.post("/make-server-324f6e20/users/:userId/permissions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const userId = c.req.param('userId');
    const { permissionCode, reason } = await c.req.json();
    
    const permissionId = `permission:${permissionCode}`;
    const overrideId = `user_permission:${userId}:${permissionCode}`;
    
    const override = {
      id: overrideId,
      userId,
      permissionId,
      isGranted: true,
      grantedBy: user.id,
      grantedAt: new Date().toISOString(),
      reason
    };
    
    await kv.set(overrideId, override);
    
    // Audit log
    await createAuditLog({
      action: 'GRANT',
      entityType: 'PERMISSION',
      entityId: permissionId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { targetUserId: userId, permissionCode, reason }
    });
    
    return c.json(override);
  } catch (error) {
    console.log('Grant permission error:', error);
    return c.json({ error: 'Failed to grant permission' }, 500);
  }
});

// Revoke permission from individual user
app.delete("/make-server-324f6e20/users/:userId/permissions/:permissionCode", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const userId = c.req.param('userId');
    const permissionCode = c.req.param('permissionCode');
    
    const overrideId = `user_permission:${userId}:${permissionCode}`;
    const permissionId = `permission:${permissionCode}`;
    
    await kv.del(overrideId);
    
    // Audit log
    await createAuditLog({
      action: 'REVOKE',
      entityType: 'PERMISSION',
      entityId: permissionId,
      userId: user.id,
      userName: userProfile.name,
      userRole: userProfile.role,
      metadata: { targetUserId: userId, permissionCode }
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Revoke permission error:', error);
    return c.json({ error: 'Failed to revoke permission' }, 500);
  }
});

// Get user's effective permissions
app.get("/make-server-324f6e20/users/:userId/effective-permissions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userId = c.req.param('userId');
    const targetUser = await kv.get(`user:${userId}`);
    
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get role permissions
    const roleId = `role:${targetUser.role}`;
    const role = await kv.get(roleId);
    const rolePermissions = role?.permissions || [];
    
    // Get user-specific overrides
    const overrides = await kv.getByPrefix(`user_permission:${userId}:`);
    const grantedPermissions = overrides
      .filter((o: any) => o.isGranted)
      .map((o: any) => o.permissionId);
    const revokedPermissions = overrides
      .filter((o: any) => !o.isGranted)
      .map((o: any) => o.permissionId);
    
    // Combine: role permissions + granted - revoked
    const effectivePermissions = [
      ...new Set([
        ...rolePermissions,
        ...grantedPermissions
      ])
    ].filter(p => !revokedPermissions.includes(p));
    
    return c.json({
      userId,
      role: targetUser.role,
      rolePermissions,
      grantedPermissions,
      revokedPermissions,
      effectivePermissions
    });
  } catch (error) {
    console.log('Get effective permissions error:', error);
    return c.json({ error: 'Failed to get effective permissions' }, 500);
  }
});

// Get audit logs
app.get("/make-server-324f6e20/audit-logs", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getServiceClient();
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const userProfile = await kv.get(`user:${user.id}`);
    if (!['SYSTEM_ADMIN'].includes(userProfile?.role)) {
      return c.json({ error: 'Admin access required' }, 403);
    }
    
    const logs = await kv.getByPrefix('audit:');
    // Sort by timestamp descending
    logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return c.json(logs);
  } catch (error) {
    console.log('Get audit logs error:', error);
    return c.json({ error: 'Failed to get audit logs' }, 500);
  }
});

// ============ SEED DATA ROUTE ============

// Seed demo data
app.post("/make-server-324f6e20/seed-data", async (c) => {
  try {
    console.log('Starting seed data operation...');
    const result = await seedData();
    console.log('Seed data completed successfully');
    return c.json(result);
  } catch (error: any) {
    console.error('❌ SEED DATA ERROR:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return c.json({ 
      error: 'Failed to seed data', 
      details: {
        message: error?.message || String(error),
        stack: error?.stack,
        type: error?.constructor?.name
      }
    }, 500);
  }
});

// OLD SEED IMPLEMENTATION (REPLACED WITH seed.tsx)
/*
app.post("/make-server-324f6e20/seed-data-old", async (c) => {
  try {
    const supabase = getServiceClient();
    
    // ============ SEED PERMISSIONS ============
    const permissionsToSeed = [
      // Applications
      { name: 'View Applications', code: 'applications.view', description: 'View application submissions', category: 'Applications', action: 'VIEW' },
      { name: 'Submit Application', code: 'applications.submit', description: 'Submit new applications', category: 'Applications', action: 'SUBMIT' },
      { name: 'Edit Application', code: 'applications.edit', description: 'Edit application details', category: 'Applications', action: 'EDIT' },
      { name: 'Assign Application', code: 'applications.assign', description: 'Assign applications to analysts', category: 'Applications', action: 'ASSIGN' },
      { name: 'Delete Application', code: 'applications.delete', description: 'Delete applications', category: 'Applications', action: 'DELETE' },
      { name: 'Request Application Info', code: 'applications.request_info', description: 'Request additional information', category: 'Applications', action: 'REQUEST_INFO' },
      
      // Verification
      { name: 'View Verification', code: 'verification.view', description: 'View verification details', category: 'Verification', action: 'VIEW' },
      { name: 'NIDA Check', code: 'verification.nida_check', description: 'Perform NIDA verification', category: 'Verification', action: 'APPROVE' },
      { name: 'RURA Check', code: 'verification.rura_check', description: 'Perform RURA verification', category: 'Verification', action: 'APPROVE' },
      { name: 'Verify Documents', code: 'verification.documents', description: 'Verify uploaded documents', category: 'Verification', action: 'APPROVE' },
      { name: 'Approve Verification', code: 'verification.approve', description: 'Approve verification stage', category: 'Verification', action: 'APPROVE' },
      { name: 'Reject Verification', code: 'verification.reject', description: 'Reject verification stage', category: 'Verification', action: 'REJECT' },
      
      // Financial
      { name: 'View Financial', code: 'financial.view', description: 'View financial information', category: 'Financial', action: 'VIEW' },
      { name: 'Initiate Payment', code: 'financial.initiate_payment', description: 'Initiate payment disbursement', category: 'Financial', action: 'INITIATE_PAYMENT' },
      { name: 'Authorize Payment', code: 'financial.authorize_payment', description: 'Authorize payment disbursement', category: 'Financial', action: 'AUTHORIZE_PAYMENT' },
      { name: 'Approve Disbursement', code: 'financial.approve_disbursement', description: 'Approve final disbursement', category: 'Financial', action: 'APPROVE' },
      { name: 'Reject Disbursement', code: 'financial.reject_disbursement', description: 'Reject disbursement', category: 'Financial', action: 'REJECT' },
      { name: 'View Payment History', code: 'financial.payment_history', description: 'View payment history', category: 'Financial', action: 'VIEW' },
      
      // Reporting
      { name: 'View Dashboard', code: 'reporting.view_dashboard', description: 'Access dashboard', category: 'Reporting', action: 'VIEW' },
      { name: 'View Analytics', code: 'reporting.view_analytics', description: 'View analytics and insights', category: 'Reporting', action: 'VIEW' },
      { name: 'Export Reports', code: 'reporting.export', description: 'Export reports and data', category: 'Reporting', action: 'EXPORT' },
      { name: 'View All Applications', code: 'reporting.view_all', description: 'View all applications system-wide', category: 'Reporting', action: 'VIEW' },
      
      // System
      { name: 'Manage Users', code: 'system.manage_users', description: 'Create and manage users', category: 'System', action: 'MANAGE_USERS' },
      { name: 'Manage Roles', code: 'system.manage_roles', description: 'Create and manage roles', category: 'System', action: 'MANAGE_ROLES' },
      { name: 'Manage Permissions', code: 'system.manage_permissions', description: 'Assign permissions', category: 'System', action: 'MANAGE_PERMISSIONS' },
      { name: 'View Audit Logs', code: 'system.view_audit_logs', description: 'View audit trail', category: 'System', action: 'VIEW_AUDIT_LOGS' },
      { name: 'Manage Criteria', code: 'system.manage_criteria', description: 'Manage eligibility criteria', category: 'System', action: 'MANAGE_USERS' },
      { name: 'System Settings', code: 'system.settings', description: 'Configure system settings', category: 'System', action: 'MANAGE_USERS' },
    ];

    console.log('Seeding permissions...');
    for (const perm of permissionsToSeed) {
      const permissionId = `permission:${perm.code}`;
      await kv.set(permissionId, {
        id: permissionId,
        ...perm,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }

    // ============ SEED ROLES ============
    const rolesToSeed = [
      {
        name: 'System Administrator',
        code: 'SYSTEM_ADMIN',
        description: 'Full system access with all permissions',
        permissions: permissionsToSeed.map(p => `permission:${p.code}`)
      },
      {
        name: 'Rebate Analyst',
        code: 'REBATE_ANALYST',
        description: 'Analyzes and verifies rebate applications',
        permissions: [
          'permission:applications.view',
          'permission:applications.edit',
          'permission:applications.request_info',
          'permission:verification.view',
          'permission:verification.nida_check',
          'permission:verification.rura_check',
          'permission:verification.documents',
          'permission:verification.approve',
          'permission:verification.reject',
          'permission:reporting.view_dashboard',
        ]
      },
      {
        name: 'QA Team',
        code: 'QA_TEAM',
        description: 'Quality assurance and review',
        permissions: [
          'permission:applications.view',
          'permission:applications.edit',
          'permission:applications.request_info',
          'permission:verification.view',
          'permission:verification.approve',
          'permission:verification.reject',
          'permission:reporting.view_dashboard',
        ]
      },
      {
        name: 'Finance Officer',
        code: 'FINANCE_OFFICER',
        description: 'Initiates payment disbursements',
        permissions: [
          'permission:applications.view',
          'permission:financial.view',
          'permission:financial.initiate_payment',
          'permission:financial.payment_history',
          'permission:reporting.view_dashboard',
        ]
      },
      {
        name: 'Rebate Manager',
        code: 'REBATE_MANAGER',
        description: 'Oversees rebate program and approves payments',
        permissions: [
          'permission:applications.view',
          'permission:applications.assign',
          'permission:applications.request_info',
          'permission:verification.view',
          'permission:verification.approve',
          'permission:verification.reject',
          'permission:financial.view',
          'permission:financial.authorize_payment',
          'permission:financial.approve_disbursement',
          'permission:financial.reject_disbursement',
          'permission:financial.payment_history',
          'permission:reporting.view_dashboard',
          'permission:reporting.view_analytics',
          'permission:reporting.export',
          'permission:reporting.view_all',
        ]
      },
      {
        name: 'M&E Officer',
        code: 'M_E_OFFICER',
        description: 'Monitoring and Evaluation officer',
        permissions: [
          'permission:applications.view',
          'permission:reporting.view_dashboard',
          'permission:reporting.view_analytics',
          'permission:reporting.export',
          'permission:reporting.view_all',
        ]
      },
      {
        name: 'Claims Officer',
        code: 'CLAIMS_OFFICER',
        description: 'Submits and manages claims',
        permissions: [
          'permission:applications.view',
          'permission:applications.submit',
          'permission:applications.edit',
          'permission:reporting.view_dashboard',
        ]
      },
      {
        name: 'Asset Financier Admin',
        code: 'ASSET_FINANCIER_ADMIN',
        description: 'Asset financing company administrator',
        permissions: [
          'permission:applications.view',
          'permission:applications.submit',
          'permission:applications.edit',
          'permission:reporting.view_dashboard',
          'permission:financial.payment_history',
        ]
      },
    ];

    console.log('Seeding roles...');
    for (const role of rolesToSeed) {
      const roleId = `role:${role.code}`;
      await kv.set(roleId, {
        id: roleId,
        ...role,
        isActive: true,
        createdAt: new Date().toISOString()
      });
    }
    
    // Create demo users
    const demoUsers = [
      { email: 'admin@mfa.gov', password: 'admin123', name: 'Admin User', role: 'SYSTEM_ADMIN' },
      { email: 'emoto1@company.com', password: 'emoto123', name: 'GreenRide Motors', role: 'ASSET_FINANCIER_ADMIN' },
      { email: 'emoto2@company.com', password: 'emoto123', name: 'EcoWheel Ltd', role: 'ASSET_FINANCIER_ADMIN' },
      { email: 'emoto3@company.com', password: 'emoto123', name: 'VoltBike Industries', role: 'CLAIMS_OFFICER' },
      { email: 'analyst@mfa.gov', password: 'analyst123', name: 'John Analyst', role: 'REBATE_ANALYST' },
      { email: 'manager1@mfa.gov', password: 'manager123', name: 'Sarah Manager', role: 'REBATE_MANAGER' },
      { email: 'program.manager@mfa.gov', password: 'progmgr123', name: 'Michael Program Manager', role: 'E_MOTO_PROGRAM_MANAGER' },
      { email: 'finance@mfa.gov', password: 'finance123', name: 'Lisa Finance', role: 'DESIGNATED_FINANCE_OFFICER' },
      { email: 'me@mfa.gov', password: 'me123', name: 'David M&E', role: 'ME_TEAM' },
    ];

    const createdUsers: any[] = [];
    
    for (const demoUser of demoUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: demoUser.email,
          password: demoUser.password,
          user_metadata: { name: demoUser.name, role: demoUser.role },
          email_confirm: true
        });
        
        if (data?.user) {
          await kv.set(`user:${data.user.id}`, {
            id: data.user.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            phoneNumber: '+1-555-0000', // Default placeholder phone number
            createdAt: new Date().toISOString()
          });
          createdUsers.push(data.user);
        }
      } catch (error) {
        console.log(`User ${demoUser.email} might already exist`);
      }
    }

    // Create eligibility criteria
    const criteria = [
      'Company registered in MFA jurisdiction for at least 1 year',
      'Valid business license and tax compliance certificate',
      'Minimum annual revenue of $500,000 in the e-mobility sector',
      'At least 10 e-motorcycles sold in the previous fiscal year',
      'Clean environmental compliance record (no violations in past 3 years)',
      'Active partnerships with at least 2 certified battery suppliers',
      'Demonstrated commitment to sustainable practices',
      'Compliance with local labor laws and regulations'
    ];

    const criteriaIds: string[] = [];
    for (let i = 0; i < criteria.length; i++) {
      const criterionId = `criteria:${crypto.randomUUID()}`;
      await kv.set(criterionId, {
        id: criterionId,
        text: criteria[i],
        enabled: true,
        order: i,
        createdAt: new Date().toISOString()
      });
      criteriaIds.push(criterionId);
    }

    // Get user IDs
    const applicants = createdUsers.filter(u => u.user_metadata.role === 'applicant');
    const analyst = createdUsers.find(u => u.user_metadata.role === 'analyst');
    const qa = createdUsers.find(u => u.user_metadata.role === 'qa');
    const cfo = createdUsers.find(u => u.user_metadata.role === 'cfo');

    // Create demo applications with various statuses
    const applications = [
      {
        companyName: 'GreenRide Motors',
        registrationNumber: 'GRM-2023-001',
        contactPerson: 'David Chen',
        contactEmail: 'david@greenride.com',
        contactPhone: '+1-555-0101',
        rebateAmount: '125000',
        status: 'disbursed',
        applicantId: applicants[0]?.id || 'demo-applicant-1'
      },
      {
        companyName: 'EcoWheel Ltd',
        registrationNumber: 'EWL-2023-002',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah@ecowheel.com',
        contactPhone: '+1-555-0102',
        rebateAmount: '95000',
        status: 'approved',
        applicantId: applicants[1]?.id || 'demo-applicant-2'
      },
      {
        companyName: 'VoltBike Industries',
        registrationNumber: 'VBI-2023-003',
        contactPerson: 'Michael Wang',
        contactEmail: 'michael@voltbike.com',
        contactPhone: '+1-555-0103',
        rebateAmount: '150000',
        status: 'program-manager-review',
        applicantId: applicants[2]?.id || 'demo-applicant-3'
      },
      {
        companyName: 'GreenRide Motors',
        registrationNumber: 'GRM-2024-004',
        contactPerson: 'David Chen',
        contactEmail: 'david@greenride.com',
        contactPhone: '+1-555-0101',
        rebateAmount: '110000',
        status: 'manager-review',
        applicantId: applicants[0]?.id || 'demo-applicant-1'
      },
      {
        companyName: 'EcoWheel Ltd',
        registrationNumber: 'EWL-2024-005',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah@ecowheel.com',
        contactPhone: '+1-555-0102',
        rebateAmount: '88000',
        status: 'under-review',
        assignedTo: analyst?.id,
        applicantId: applicants[1]?.id || 'demo-applicant-2'
      },
      {
        companyName: 'VoltBike Industries',
        registrationNumber: 'VBI-2024-006',
        contactPerson: 'Michael Wang',
        contactEmail: 'michael@voltbike.com',
        contactPhone: '+1-555-0103',
        rebateAmount: '175000',
        status: 'assigned',
        assignedTo: analyst?.id,
        applicantId: applicants[2]?.id || 'demo-applicant-3'
      },
      {
        companyName: 'SpeedE Motors',
        registrationNumber: 'SEM-2024-007',
        contactPerson: 'Emma Davis',
        contactEmail: 'emma@speede.com',
        contactPhone: '+1-555-0104',
        rebateAmount: '62000',
        status: 'rejected',
        applicantId: applicants[0]?.id || 'demo-applicant-1'
      },
      {
        companyName: 'ThunderBolt Bikes',
        registrationNumber: 'TBB-2024-008',
        contactPerson: 'James Lee',
        contactEmail: 'james@thunderbolt.com',
        contactPhone: '+1-555-0105',
        rebateAmount: '145000',
        status: 'pending',
        applicantId: applicants[1]?.id || 'demo-applicant-2'
      }
    ];

    const applicationIds: string[] = [];
    for (const appData of applications) {
      const appId = `application:${crypto.randomUUID()}`;
      await kv.set(appId, {
        id: appId,
        ...appData,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
      applicationIds.push(appId);

      // Add to user's application list
      const userApps = await kv.get(`user:${appData.applicantId}:applications`) || [];
      await kv.set(`user:${appData.applicantId}:applications`, [...userApps, appId]);
    }

    // Create evaluations for applications
    const evaluationStatuses = ['under-review', 'manager-review', 'program-manager-review', 'approved-pending-lease', 'lease-review', 'pending-payment', 'payment-complete', 'approved', 'disbursed', 'rejected'];
    for (const appId of applicationIds) {
      const app: any = await kv.get(appId);
      
      if (evaluationStatuses.includes(app.status)) {
        const score = Math.floor(Math.random() * 40) + 60; // 60-100%
        const criteriaEvaluations: Record<string, boolean> = {};
        
        criteriaIds.forEach(critId => {
          criteriaEvaluations[critId] = Math.random() > (score < 70 ? 0.3 : 0.1);
        });

        await kv.set(`evaluation:${appId}`, {
          id: `evaluation:${appId}`,
          applicationId: appId,
          evaluatorId: analyst?.id || 'demo-analyst',
          evaluatorRole: 'analyst',
          criteriaEvaluations,
          score,
          notes: 'Evaluation completed. All documentation reviewed.',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Create disbursements for disbursed applications
    const disbursedApps = applicationIds.filter(async (appId) => {
      const app: any = await kv.get(appId);
      return app.status === 'disbursed';
    });

    for (const appId of disbursedApps) {
      await kv.set(`disbursement:${appId}`, {
        id: `disbursement:${appId}`,
        applicationId: appId,
        amount: '125000',
        referenceNumber: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
        bankDetails: 'Bank: Standard Bank, Account: 1234567890',
        status: 'success',
        processedBy: createdUsers.find(u => u.user_metadata.role === 'finance')?.id || 'demo-finance',
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      message: 'Demo data seeded successfully',
      stats: {
        users: createdUsers.length,
        criteria: criteriaIds.length,
        applications: applicationIds.length,
        permissions: permissionsToSeed.length,
        roles: rolesToSeed.length
      }
    });
  } catch (error) {
    console.log('Seed data error:', error);
    return c.json({ error: 'Failed to seed data', details: error }, 500);
  }
});
*/

// ============ OTP / 2FA ROUTES ============

// Request OTP (after successful password validation)
app.post("/make-server-324f6e20/auth/request-otp", async (c) => {
  try {
    const { userId, method } = await c.req.json();
    
    if (!userId || !method) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    if (!['sms', 'email'].includes(method)) {
      return c.json({ error: 'Invalid OTP method. Must be sms or email.' }, 400);
    }
    
    // Get user data
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Check if resend is allowed
    const resendCheck = await otpService.canResendOTP(userId);
    if (!resendCheck.allowed) {
      return c.json({ error: resendCheck.error }, 429);
    }
    
    // Generate OTP
    const otp = otpService.generateOTP();
    const expiryMinutes = method === 'sms' ? 10 : 15;
    
    // Store OTP
    await otpService.storeOTP(userId, otp, method, expiryMinutes);
    
    // Send OTP
    if (method === 'sms') {
      const phoneNumber = userData.phoneNumber || '+1-555-0000';
      const message = `Your MFA Rebate System verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`;
      await otpService.sendSMS(phoneNumber, message);
    } else {
      const verificationLink = otpService.generateVerificationLink(userId, otp);
      const htmlContent = `
        <h2>MFA Rebate System - Email Verification</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code is valid for ${expiryMinutes} minutes.</p>
        <p>Or click the link below to verify automatically:</p>
        <a href="${verificationLink}">Verify Email</a>
      `;
      await otpService.sendEmail(
        userData.email,
        'MFA Rebate System - Verification Code',
        htmlContent
      );
    }
    
    // Increment resend count if this is a resend
    if (resendCheck.resendCount && resendCheck.resendCount > 0) {
      await otpService.incrementResendCount(userId);
    }
    
    // Log audit
    await kv.set(`audit:otp-request:${Date.now()}:${userId}`, {
      userId,
      action: 'otp_requested',
      method,
      timestamp: new Date().toISOString(),
      email: userData.email
    });
    
    return c.json({
      success: true,
      method,
      expiryMinutes,
      destination: method === 'sms' ? userData.phoneNumber : userData.email
    });
  } catch (error: any) {
    console.error('OTP request error:', error);
    return c.json({ error: 'Failed to send OTP code' }, 500);
  }
});

// Verify OTP
app.post("/make-server-324f6e20/auth/verify-otp", async (c) => {
  try {
    const { userId, code } = await c.req.json();
    
    if (!userId || !code) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // DEMO MODE BYPASS: Accept any 6-digit code
    // Remove this block when real SMS/Email services are configured
    const isDemoMode = true; // Set to false to enforce real OTP validation
    if (isDemoMode && /^\d{6}$/.test(code)) {
      console.log(`🔓 [DEMO MODE] Accepting any 6-digit code for user ${userId}`);
      
      // Clear any existing OTP data to prevent lockouts
      const otpKey = `otp:${userId}`;
      await kv.del(otpKey);
      
      // Log audit
      const userData = await kv.get(`user:${userId}`);
      await kv.set(`audit:otp-verify:${Date.now()}:${userId}`, {
        userId,
        action: 'otp_verified_success_demo_mode',
        timestamp: new Date().toISOString(),
        email: userData?.email || 'unknown',
        note: 'Demo mode - any 6-digit code accepted'
      });
      
      return c.json({
        success: true,
        message: 'OTP verified successfully (demo mode)'
      });
    }
    
    // Verify OTP (real validation when demo mode is off)
    const result = await otpService.verifyOTP(userId, code);
    
    // Get user data for audit
    const userData = await kv.get(`user:${userId}`);
    
    // Log audit
    await kv.set(`audit:otp-verify:${Date.now()}:${userId}`, {
      userId,
      action: result.valid ? 'otp_verified_success' : 'otp_verified_failed',
      timestamp: new Date().toISOString(),
      email: userData?.email || 'unknown',
      error: result.error
    });
    
    if (!result.valid) {
      return c.json({
        success: false,
        error: result.error,
        lockoutUntil: result.lockoutUntil
      }, 400);
    }
    
    return c.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return c.json({ error: 'Failed to verify OTP code' }, 500);
  }
});

// Email verification link handler
app.get("/make-server-324f6e20/verify-email-otp", async (c) => {
  try {
    const userId = c.req.query('userId');
    const code = c.req.query('code');
    
    if (!userId || !code) {
      return c.html('<h1>Invalid verification link</h1>');
    }
    
    // DEMO MODE BYPASS: Accept any 6-digit code
    const isDemoMode = true;
    if (isDemoMode && /^\d{6}$/.test(code)) {
      console.log(`🔓 [DEMO MODE] Email link verified for user ${userId}`);
      
      // Clear OTP data
      await kv.del(`otp:${userId}`);
      
      // Log audit
      const userData = await kv.get(`user:${userId}`);
      await kv.set(`audit:email-verify:${Date.now()}:${userId}`, {
        userId,
        action: 'email_link_verified_success_demo_mode',
        timestamp: new Date().toISOString(),
        email: userData?.email || 'unknown',
        note: 'Demo mode - any 6-digit code accepted'
      });
      
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #16a34a;">Email Verified Successfully! (Demo Mode)</h1>
            <p>Your email has been verified. You can now close this window and return to the login page.</p>
            <a href="/" style="color: #023F40; text-decoration: none; padding: 10px 20px; background: #023F40; color: white; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Login</a>
          </body>
        </html>
      `);
    }
    
    // Verify OTP (real validation when demo mode is off)
    const result = await otpService.verifyOTP(userId, code);
    
    // Get user data for audit
    const userData = await kv.get(`user:${userId}`);
    
    // Log audit
    await kv.set(`audit:email-verify:${Date.now()}:${userId}`, {
      userId,
      action: result.valid ? 'email_link_verified_success' : 'email_link_verified_failed',
      timestamp: new Date().toISOString(),
      email: userData?.email || 'unknown'
    });
    
    if (!result.valid) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">Verification Failed</h1>
            <p>${result.error}</p>
            <a href="/" style="color: #023F40;">Return to Login</a>
          </body>
        </html>
      `);
    }
    
    return c.html(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #16a34a;">Email Verified Successfully!</h1>
          <p>Your email has been verified. You can now close this window and return to the login page.</p>
          <a href="/" style="color: #023F40; text-decoration: none; padding: 10px 20px; background: #023F40; color: white; border-radius: 5px; display: inline-block; margin-top: 20px;">Return to Login</a>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Email verification error:', error);
    return c.html('<h1>Verification failed</h1>');
  }
});

// Update user credentials (force password change)
app.post("/make-server-324f6e20/auth/update-credentials", async (c) => {
  try {
    const { userId, name, email, password, phoneNumber } = await c.req.json();

    if (!userId || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user data
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update Supabase auth user
    const supabase = getServiceClient();
    const updateData: any = {
      password,
      user_metadata: {
        ...userData,
        name: name || userData.name,
        requiresPasswordChange: false
      }
    };

    if (email && email !== userData.email) {
      updateData.email = email;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (authError) {
      console.error('Auth update error:', authError);
      return c.json({ error: 'Failed to update credentials' }, 500);
    }

    // Update KV store
    userData.name = name || userData.name;
    userData.email = email || userData.email;
    userData.phoneNumber = phoneNumber || userData.phoneNumber;
    userData.requiresPasswordChange = false;
    userData.updatedAt = new Date().toISOString();

    await kv.set(`user:${userId}`, userData);

    // Log audit
    await kv.set(`audit:credential-update:${Date.now()}:${userId}`, {
      userId,
      action: 'credentials_updated',
      timestamp: new Date().toISOString(),
      email: userData.email
    });

    return c.json({
      success: true,
      message: 'Credentials updated successfully'
    });
  } catch (error: any) {
    console.error('Credential update error:', error);
    return c.json({ error: 'Failed to update credentials' }, 500);
  }
});

// ============ ASSET FINANCIER REGISTRATION ROUTES ============

// Public registration endpoint for Asset Financiers
app.post("/make-server-324f6e20/financier/register", async (c) => {
  try {
    const data = await c.req.json();
    const {
      companyLegalName,
      companyAddress,
      companyRegistrationNumber,
      companyPhoneNumber,
      companyEmail,
      companyLogo,
      companyType,
      contactFullName,
      contactPosition,
      contactEmail,
      contactPhone
    } = data;

    // Validate required fields
    if (!companyLegalName || !companyEmail || !contactEmail || !contactFullName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if company already exists
    const existingOrgs = await kv.getByPrefix('financier:');
    const duplicate = existingOrgs.find((org: any) => 
      org.companyEmail === companyEmail || 
      org.companyLegalName === companyLegalName ||
      org.contactEmail === contactEmail
    );

    if (duplicate) {
      return c.json({ 
        error: 'An organization with this name, company email, or contact email already exists' 
      }, 400);
    }

    // Create organization record
    const orgId = `org-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const organizationData = {
      id: orgId,
      companyLegalName,
      companyAddress,
      companyRegistrationNumber,
      companyPhoneNumber,
      companyEmail,
      companyLogo,
      companyType,
      status: 'FINANCIER_PENDING_APPROVAL',
      submittedAt: new Date().toISOString()
    };

    await kv.set(`financier:${orgId}`, organizationData);

    // Create pending user record for primary contact
    const pendingUserId = `pending-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const pendingUserData = {
      id: pendingUserId,
      name: contactFullName,
      email: contactEmail,
      phoneNumber: contactPhone,
      position: contactPosition,
      organizationId: orgId,
      role: 'PENDING_FINANCIER_ADMIN',
      createdAt: new Date().toISOString()
    };

    await kv.set(`pending-user:${pendingUserId}`, pendingUserData);

    // Send confirmation emails (mock for now)
    await otpService.sendEmail(
      companyEmail,
      'MFA Rebate System - Registration Received',
      `
        <h2>Registration Confirmation</h2>
        <p>Dear ${companyLegalName},</p>
        <p>Thank you for submitting your registration to partner with the MFA Rebate System.</p>
        <p>Your application is currently under review by our RGF staff.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our team will review your application</li>
          <li>You will receive an email notification about the approval status</li>
          <li>If approved, your primary contact (${contactFullName}) will receive login credentials</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
    );

    await otpService.sendEmail(
      contactEmail,
      'MFA Rebate System - Registration Received',
      `
        <h2>Registration Confirmation</h2>
        <p>Dear ${contactFullName},</p>
        <p>Your organization (${companyLegalName}) has been registered for the MFA Rebate System.</p>
        <p>Your application is currently pending approval from RGF staff.</p>
        <p>You will receive another email once your application has been reviewed.</p>
      `
    );

    // Notify system admins (get all admins)
    const allUsers = await kv.getByPrefix('user:');
    const admins = allUsers.filter((u: any) => u.role === 'SYSTEM_ADMIN' || u.role === 'admin');
    
    for (const admin of admins) {
      await otpService.sendEmail(
        admin.email,
        'New Asset Financier Registration - Action Required',
        `
          <h2>New Registration Request</h2>
          <p>A new Asset Financier has registered and requires your review:</p>
          <p><strong>Organization:</strong> ${companyLegalName}</p>
          <p><strong>Type:</strong> ${companyType}</p>
          <p><strong>Contact:</strong> ${contactFullName} (${contactEmail})</p>
          <p>Please log in to the system to review and approve/reject this application.</p>
        `
      );
    }

    // Log audit
    await kv.set(`audit:financier-registration:${Date.now()}:${orgId}`, {
      action: 'financier_registration_submitted',
      organizationId: orgId,
      companyName: companyLegalName,
      contactEmail,
      timestamp: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: 'Registration submitted successfully',
      organizationId: orgId
    });
  } catch (error: any) {
    console.error('Financier registration error:', error);
    return c.json({ error: 'Failed to submit registration' }, 500);
  }
});

// Get pending registrations (System Admin only)
app.get("/make-server-324f6e20/financier/pending", async (c) => {
  try {
    const allFinanciers = await kv.getByPrefix('financier:');
    const pending = allFinanciers.filter((f: any) => f.status === 'FINANCIER_PENDING_APPROVAL');
    
    return c.json({ success: true, data: pending });
  } catch (error: any) {
    console.error('Get pending financiers error:', error);
    return c.json({ error: 'Failed to fetch pending registrations' }, 500);
  }
});

// Approve financier registration (System Admin only)
app.post("/make-server-324f6e20/financier/approve/:orgId", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    
    // Get organization
    const org = await kv.get(`financier:${orgId}`);
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Get pending user
    const allPendingUsers = await kv.getByPrefix('pending-user:');
    const pendingUser = allPendingUsers.find((u: any) => u.organizationId === orgId);
    
    if (!pendingUser) {
      return c.json({ error: 'Primary contact not found' }, 404);
    }

    // Generate temporary password
    const tempPassword = `Temp${Math.random().toString(36).substring(2, 10)}!`;

    // Create user in Supabase Auth
    const supabase = getServiceClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pendingUser.email,
      password: tempPassword,
      user_metadata: {
        name: pendingUser.name,
        role: 'FINANCIER_ADMIN',
        organizationId: orgId,
        requiresPasswordChange: true
      },
      email_confirm: true
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return c.json({ error: 'Failed to create user account' }, 500);
    }

    // Update organization status
    org.status = 'APPROVED';
    org.approvedAt = new Date().toISOString();
    await kv.set(`financier:${orgId}`, org);

    // Create user record in KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email: pendingUser.email,
      name: pendingUser.name,
      phoneNumber: pendingUser.phoneNumber,
      role: 'FINANCIER_ADMIN',
      organizationId: orgId,
      position: pendingUser.position,
      requiresPasswordChange: true,
      createdAt: new Date().toISOString()
    });

    // Create master agreement record
    const agreementId = `agreement-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    await kv.set(`agreement:${agreementId}`, {
      id: agreementId,
      organizationId: orgId,
      organizationName: org.companyLegalName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    // Delete pending user
    await kv.del(`pending-user:${pendingUser.id}`);

    // Send approval email with credentials
    await otpService.sendEmail(
      pendingUser.email,
      'MFA Rebate System - Registration Approved',
      `
        <h2>Congratulations! Your Registration Has Been Approved</h2>
        <p>Dear ${pendingUser.name},</p>
        <p>Your organization (${org.companyLegalName}) has been approved to partner with the MFA Rebate System.</p>
        <p><strong>Your Login Credentials:</strong></p>
        <p>Email: ${pendingUser.email}</p>
        <p>Temporary Password: ${tempPassword}</p>
        <p><strong>Important:</strong> You will be required to change your password upon first login for security purposes.</p>
        <p><a href="/">Click here to log in</a></p>
      `
    );

    // Send notification to company email
    await otpService.sendEmail(
      org.companyEmail,
      'MFA Rebate System - Partnership Approved',
      `
        <h2>Partnership Approved</h2>
        <p>Dear ${org.companyLegalName},</p>
        <p>Congratulations! Your partnership application with the MFA Rebate System has been approved.</p>
        <p>Your primary contact (${pendingUser.name}) has been sent login credentials.</p>
        <p>Welcome to the MFA Rebate System!</p>
      `
    );

    // Log audit
    await kv.set(`audit:financier-approval:${Date.now()}:${orgId}`, {
      action: 'financier_approved',
      organizationId: orgId,
      organizationName: org.companyLegalName,
      adminEmail: pendingUser.email,
      timestamp: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: 'Organization approved successfully'
    });
  } catch (error: any) {
    console.error('Financier approval error:', error);
    return c.json({ error: 'Failed to approve organization' }, 500);
  }
});

// Reject financier registration (System Admin only)
app.post("/make-server-324f6e20/financier/reject/:orgId", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const { reason } = await c.req.json();

    if (!reason) {
      return c.json({ error: 'Rejection reason is required' }, 400);
    }

    // Get organization
    const org = await kv.get(`financier:${orgId}`);
    if (!org) {
      return c.json({ error: 'Organization not found' }, 404);
    }

    // Get pending user
    const allPendingUsers = await kv.getByPrefix('pending-user:');
    const pendingUser = allPendingUsers.find((u: any) => u.organizationId === orgId);

    // Update organization status
    org.status = 'FINANCIER_REJECTED';
    org.rejectedAt = new Date().toISOString();
    org.rejectionReason = reason;
    await kv.set(`financier:${orgId}`, org);

    // Send rejection emails
    if (pendingUser) {
      await otpService.sendEmail(
        pendingUser.email,
        'MFA Rebate System - Registration Update',
        `
          <h2>Registration Decision</h2>
          <p>Dear ${pendingUser.name},</p>
          <p>Thank you for your interest in partnering with the MFA Rebate System.</p>
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you have any questions or would like to discuss this decision, please contact our support team.</p>
        `
      );
    }

    await otpService.sendEmail(
      org.companyEmail,
      'MFA Rebate System - Registration Update',
      `
        <h2>Registration Decision</h2>
        <p>Dear ${org.companyLegalName},</p>
        <p>Thank you for your interest in partnering with the MFA Rebate System.</p>
        <p>After careful review, your application has not been approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
      `
    );

    // Delete pending user
    if (pendingUser) {
      await kv.del(`pending-user:${pendingUser.id}`);
    }

    // Log audit
    await kv.set(`audit:financier-rejection:${Date.now()}:${orgId}`, {
      action: 'financier_rejected',
      organizationId: orgId,
      organizationName: org.companyLegalName,
      reason,
      timestamp: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: 'Organization rejected'
    });
  } catch (error: any) {
    console.error('Financier rejection error:', error);
    return c.json({ error: 'Failed to reject organization' }, 500);
  }
});

// ============================================================================
// ASSET FINANCIER INTERNAL USER MANAGEMENT ROUTES
// ============================================================================

// Get all staff users for an organization
app.get("/make-server-324f6e20/asset-financier/users", async (c) => {
  try {
    const organizationId = c.req.query('organizationId');
    
    if (!organizationId) {
      return c.json({ error: 'Organization ID is required' }, 400);
    }

    // Get all users for this organization
    const allUsers = await kv.getByPrefix('user:');
    const organizationUsers = allUsers
      .filter((item: any) => 
        item?.value &&
        item.value.assetFinancierId === organizationId &&
        (item.value.role === 'ASSET_FINANCIER_STAFF' || item.value.role === 'ASSET_FINANCIER_OFFICER')
      );

    // Get all applications for this organization
    const allApplications = await kv.getByPrefix('application:');
    const orgApplications = allApplications.filter((item: any) => 
      item?.value && item.value.assetFinancierId === organizationId
    );

    // Map users with their application data
    const usersWithApplications = organizationUsers.map((item: any) => {
      const userId = item.value.id;
      
      // Get applications submitted by this user
      const userApplications = orgApplications.filter((app: any) => 
        app.value.submittedBy === userId || app.value.applicantId === userId
      );

      const applications = userApplications.map((app: any) => ({
        id: app.value.id,
        applicationNumber: app.value.applicationNumber,
        status: app.value.status,
        riderName: `${app.value.firstName} ${app.value.lastName}`,
        vehicleBrand: app.value.vehicleBrand,
        vehicleModel: app.value.vehicleModel,
        rebateAmount: app.value.rebateAmount,
        submittedAt: app.value.submittedAt
      }));

      // Calculate stats
      const pending = applications.filter((a: any) => 
        ['submitted', 'under_review', 'info_requested', 'pending_lease'].includes(a.status)
      ).length;
      const approved = applications.filter((a: any) => 
        ['approved', 'awaiting_payment', 'payment_processing', 'completed'].includes(a.status)
      ).length;
      const rejected = applications.filter((a: any) => a.status === 'rejected').length;

      return {
        id: item.value.id,
        name: item.value.name,
        email: item.value.email,
        phoneNumber: item.value.phoneNumber || '+1-555-0000',
        role: item.value.role,
        permissions: item.value.permissions || [],
        createdAt: item.value.createdAt,
        createdBy: item.value.createdBy,
        isActive: item.value.isActive !== false,
        applicationCount: applications.length,
        pendingCount: pending,
        approvedCount: approved,
        rejectedCount: rejected,
        applications: applications
      };
    });

    return c.json({ users: usersWithApplications });
  } catch (error: any) {
    console.error('Error fetching organization users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Create new staff user
app.post("/make-server-324f6e20/asset-financier/users/create", async (c) => {
  try {
    const { organizationId, name, email, phoneNumber, role } = await c.req.json();

    if (!organizationId || !name || !email || !phoneNumber || !role) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (!['ASSET_FINANCIER_STAFF', 'ASSET_FINANCIER_OFFICER'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Check if email already exists
    const allUsers = await kv.getByPrefix('user:');
    const existingUser = allUsers.find((item: any) => item.value.email === email);
    
    if (existingUser) {
      return c.json({ error: 'Email already in use' }, 400);
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword();

    // Create user in Supabase Auth
    const supabase = getServiceClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError || !authData.user) {
      console.error('Supabase auth creation error:', authError);
      return c.json({ error: 'Failed to create authentication account' }, 500);
    }

    const userId = authData.user.id;

    // Create user profile
    const userProfile = {
      id: userId,
      email,
      name,
      phoneNumber,
      role,
      assetFinancierId: organizationId,
      permissions: [],
      createdAt: new Date().toISOString(),
      createdBy: organizationId,
      isActive: true,
      requiresPasswordChange: true
    };

    await kv.set(`user:${userId}`, userProfile);

    // Log audit trail
    await kv.set(`audit:user-created:${Date.now()}:${userId}`, {
      userId,
      action: 'asset_financier_staff_created',
      createdBy: organizationId,
      timestamp: new Date().toISOString(),
      email,
      role
    });

    // Send welcome email (console log for demo mode)
    console.log(`
      ====================================
      WELCOME EMAIL (Demo Mode)
      ====================================
      To: ${email}
      Subject: Welcome to MFA Rebate System
      
      Hello ${name},
      
      Your account has been created for the Asset Financier organization.
      
      Login Credentials:
      Email: ${email}
      Temporary Password: ${tempPassword}
      
      Login URL: ${Deno.env.get('SUPABASE_URL') || 'http://localhost:8000'}
      
      IMPORTANT: You must change your password on first login.
      
      Best regards,
      MFA Rebate System Team
      ====================================
    `);

    return c.json({
      success: true,
      userId,
      message: 'Staff member created successfully',
      tempPassword // In production, this should only be sent via email
    });
  } catch (error: any) {
    console.error('Error creating staff user:', error);
    return c.json({ error: 'Failed to create staff member' }, 500);
  }
});

// Update user permissions
app.put("/make-server-324f6e20/asset-financier/users/:userId/permissions", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { permissions } = await c.req.json();

    if (!userId || !permissions) {
      return c.json({ error: 'User ID and permissions are required' }, 400);
    }

    // Validate permissions are Asset Financier permissions only
    const validAFPermissions = [
      'AF_SUBMIT_APPLICATIONS',
      'AF_VIEW_OWN_APPLICATIONS',
      'AF_EDIT_OWN_APPLICATIONS',
      'AF_UPLOAD_DOCUMENTS',
      'AF_RESPOND_TO_INFO_REQUESTS',
      'AF_VIEW_BANK_DETAILS',
      'AF_UPDATE_BANK_DETAILS',
      'AF_RECORD_REPAYMENTS'
    ];

    const invalidPermissions = permissions.filter((p: string) => !validAFPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return c.json({ error: `Invalid permissions: ${invalidPermissions.join(', ')}` }, 400);
    }

    // Get user
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update permissions
    userData.permissions = permissions;
    userData.updatedAt = new Date().toISOString();
    await kv.set(`user:${userId}`, userData);

    // Log audit trail
    await kv.set(`audit:permissions-updated:${Date.now()}:${userId}`, {
      userId,
      action: 'permissions_updated',
      permissions,
      timestamp: new Date().toISOString()
    });

    return c.json({
      success: true,
      message: 'Permissions updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating permissions:', error);
    return c.json({ error: 'Failed to update permissions' }, 500);
  }
});

// Helper function to generate secure password
function generateSecurePassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ============================================================================
// BANK DETAILS MANAGEMENT ROUTES
// ============================================================================

// Get bank details for organization
app.get("/make-server-324f6e20/asset-financier/bank-details", async (c) => {
  try {
    const organizationId = c.req.query('organizationId');
    
    if (!organizationId) {
      return c.json({ error: 'Organization ID is required' }, 400);
    }

    const bankDetails = await kv.get(`bank-details:${organizationId}`);
    
    return c.json({ bankDetails: bankDetails || null });
  } catch (error: any) {
    console.error('Error fetching bank details:', error);
    return c.json({ error: 'Failed to fetch bank details' }, 500);
  }
});

// Save/update bank details
app.post("/make-server-324f6e20/asset-financier/bank-details", async (c) => {
  try {
    const { 
      organizationId, 
      bankName, 
      accountName, 
      accountNumber, 
      branchName, 
      swiftCode 
    } = await c.req.json();

    if (!organizationId || !bankName || !accountName || !accountNumber) {
      return c.json({ error: 'Organization ID, bank name, account name, and account number are required' }, 400);
    }

    // Check if updating existing details
    const existingDetails = await kv.get(`bank-details:${organizationId}`);
    const isUpdate = !!existingDetails;

    const bankDetails = {
      bankName,
      accountName,
      accountNumber,
      branchName: branchName || '',
      swiftCode: swiftCode || '',
      updatedAt: new Date().toISOString(),
      updatedBy: organizationId
    };

    await kv.set(`bank-details:${organizationId}`, bankDetails);

    // Log audit trail
    await kv.set(`audit:bank-details-${isUpdate ? 'updated' : 'created'}:${Date.now()}:${organizationId}`, {
      organizationId,
      action: isUpdate ? 'bank_details_updated' : 'bank_details_created',
      timestamp: new Date().toISOString(),
      bankName,
      accountName: accountName.substring(0, 10) + '...' // Partial for security
    });

    // If update, notify RGF Finance (console log for demo)
    if (isUpdate) {
      console.log(`
        ====================================
        BANK DETAILS UPDATE ALERT (Demo Mode)
        ====================================
        SECURITY ALERT: Bank details have been modified
        
        Organization ID: ${organizationId}
        Bank: ${bankName}
        Account: ${accountName}
        Updated: ${new Date().toISOString()}
        
        Action Required: Finance team should verify this change
        ====================================
      `);
    }

    return c.json({
      success: true,
      message: isUpdate ? 'Bank details updated successfully' : 'Bank details saved successfully'
    });
  } catch (error: any) {
    console.error('Error saving bank details:', error);
    return c.json({ error: 'Failed to save bank details' }, 500);
  }
});

// ============================================================================
// APPLICATIONS MANAGEMENT ROUTES
// ============================================================================

// Get applications for organization
app.get("/make-server-324f6e20/asset-financier/applications", async (c) => {
  try {
    const organizationId = c.req.query('organizationId');
    const status = c.req.query('status');
    
    if (!organizationId) {
      return c.json({ error: 'Organization ID is required' }, 400);
    }

    // Get all applications
    const allApplications = await kv.getByPrefix('application:');
    
    let applications = allApplications
      .filter((item: any) => item?.value && item.value.organizationId === organizationId)
      .map((item: any) => ({
        id: item.value.id,
        applicantName: item.value.applicantName || 'Unknown',
        applicantNationalId: item.value.applicantNationalId,
        status: item.value.status,
        submittedAt: item.value.submittedAt || item.value.createdAt,
        vehicleBrand: item.value.vehicleBrand || 'N/A',
        vehicleModel: item.value.vehicleModel || 'N/A',
        rebateAmount: item.value.rebateAmount || 0
      }));

    // Filter by status if provided
    if (status && status !== 'ALL') {
      applications = applications.filter((app: any) => app.status === status);
    }

    // Sort by submission date (newest first)
    applications.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

Deno.serve((req) => {
  const url = new URL(req.url);
  let path = url.pathname;

  if (path.startsWith('/functions/v1/make-server-324f6e20')) {
    path = path.replace('/functions/v1', '');
  } else if (!path.startsWith('/make-server-324f6e20')) {
    path = `/make-server-324f6e20${path.startsWith('/') ? path : `/${path}`}`;
  }

  url.pathname = path;
  return app.fetch(new Request(url.toString(), req));
});