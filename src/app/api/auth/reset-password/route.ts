import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isDatabaseConfigured, getPrismaClient } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Password reset requires a connected database. See the demo credentials on the login page instead." },
      { status: 503 }
    );
  }

  const { token, password } = await req.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid token or password too short (min 8 characters)" }, { status: 400 });
  }

  try {
    const prisma = getPrismaClient();
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    console.error("[reset-password] Failed:", err);
    return NextResponse.json({ error: "Something went wrong. Please request a new reset link." }, { status: 500 });
  }
}
