import * as kv from "./kv_store.tsx";

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiry and metadata
export async function storeOTP(
  userId: string,
  otp: string,
  method: 'sms' | 'email',
  expiryMinutes: number
) {
  const otpData = {
    code: otp,
    method,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
    attempts: 0,
    resendCount: 0,
    lockoutUntil: null as string | null
  };
  
  await kv.set(`otp:${userId}`, otpData);
  return otpData;
}

// Verify OTP
export async function verifyOTP(userId: string, code: string): Promise<{
  valid: boolean;
  error?: string;
  lockoutUntil?: string;
}> {
  const otpData = await kv.get(`otp:${userId}`);
  
  if (!otpData) {
    return { valid: false, error: 'No OTP found. Please request a new code.' };
  }
  
  // Check lockout
  if (otpData.lockoutUntil && new Date(otpData.lockoutUntil) > new Date()) {
    return {
      valid: false,
      error: 'Account temporarily locked due to too many failed attempts.',
      lockoutUntil: otpData.lockoutUntil
    };
  }
  
  // Check expiry
  if (new Date(otpData.expiresAt) < new Date()) {
    await kv.del(`otp:${userId}`);
    return { valid: false, error: 'OTP has expired. Please request a new code.' };
  }
  
  // Check code match
  if (otpData.code !== code) {
    otpData.attempts += 1;
    
    // Lock after 3 failed attempts
    if (otpData.attempts >= 3) {
      otpData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await kv.set(`otp:${userId}`, otpData);
      return {
        valid: false,
        error: 'Too many failed attempts. Account locked for 15 minutes.',
        lockoutUntil: otpData.lockoutUntil
      };
    }
    
    await kv.set(`otp:${userId}`, otpData);
    return {
      valid: false,
      error: `Invalid code. ${3 - otpData.attempts} attempts remaining.`
    };
  }
  
  // Valid OTP - clean up
  await kv.del(`otp:${userId}`);
  return { valid: true };
}

// Check if resend is allowed
export async function canResendOTP(userId: string): Promise<{
  allowed: boolean;
  error?: string;
  resendCount?: number;
}> {
  const otpData = await kv.get(`otp:${userId}`);
  
  if (!otpData) {
    return { allowed: true, resendCount: 0 };
  }
  
  // Check lockout
  if (otpData.lockoutUntil && new Date(otpData.lockoutUntil) > new Date()) {
    return {
      allowed: false,
      error: 'Account temporarily locked. Cannot resend code.'
    };
  }
  
  // Maximum 3 resends
  if (otpData.resendCount >= 3) {
    return {
      allowed: false,
      error: 'Maximum resend attempts reached. Please try again later.'
    };
  }
  
  return { allowed: true, resendCount: otpData.resendCount };
}

// Increment resend count
export async function incrementResendCount(userId: string) {
  const otpData = await kv.get(`otp:${userId}`);
  if (otpData) {
    otpData.resendCount += 1;
    await kv.set(`otp:${userId}`, otpData);
  }
}

// Mock SMS sending (in production, use Twilio, AWS SNS, etc.)
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  console.log(`[SMS] To: ${phoneNumber}`);
  console.log(`[SMS] Message: ${message}`);
  
  // In production, integrate with SMS provider:
  // const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  // const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  // const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  // Mock success for development
  return true;
}

// Mock Email sending (in production, use SendGrid, AWS SES, etc.)
export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Content: ${htmlContent}`);
  
  // In production, integrate with email provider:
  // const apiKey = Deno.env.get('SENDGRID_API_KEY');
  
  // Mock success for development
  return true;
}

// Generate email verification link
export function generateVerificationLink(userId: string, otp: string): string {
  const baseUrl = Deno.env.get('SUPABASE_URL');
  return `${baseUrl}/functions/v1/make-server-324f6e20/verify-email-otp?userId=${userId}&code=${otp}`;
}
