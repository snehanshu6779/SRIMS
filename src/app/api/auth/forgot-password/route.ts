import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";
import { users } from "@/lib/data/mock-data";

/**
 * Forgot-password request handler.
 *
 * No SMTP/email provider is configured in this build, so instead of actually
 * sending an email, the reset link is logged to the server console — anyone
 * running this locally can grab it from their terminal. Wiring a real
 * provider (Resend, SES, Postmark, etc.) later is a matter of replacing the
 * console.log below with an actual send call; everything else (token
 * generation, expiry, the reset page itself) is already real and working.
 *
 * Always returns a generic success message regardless of whether the email
 * exists — this is standard practice so the endpoint can't be used to probe
 * which email addresses have accounts.
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a password reset link has been sent.",
  });

  if (!email) return genericResponse;

  if (!isDatabaseConfigured) {
    // Mock-data mode: there's nowhere durable to store a reset token, and
    // the demo accounts' passwords are meant to stay as documented on the
    // login screen. Acknowledge the request without doing anything further.
    const known = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (known) {
      console.log(
        `[forgot-password] No database configured — can't issue a real reset token. ` +
        `For this demo build, use the credentials shown on the login page instead.`
      );
    }
    return genericResponse;
  }

  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
      // TODO: replace with a real email send (Resend/SES/Postmark/etc.)
      console.log(`[forgot-password] Reset link for ${user.email}: ${resetUrl}`);
    }
  } catch (err) {
    console.error("[forgot-password] Lookup/token creation failed:", err);
    // Still return the generic response — don't leak DB errors to the client.
  }

  return genericResponse;
}
