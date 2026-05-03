import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { cancelToken: token },
  });

  if (!inquiry) {
    return NextResponse.redirect(new URL("/storniert?status=invalid", _req.url));
  }

  if (inquiry.cancelledAt || inquiry.status === "storniert") {
    return NextResponse.redirect(new URL("/storniert?status=already", _req.url));
  }

  await prisma.inquiry.update({
    where: { id: inquiry.id },
    data: {
      status: "storniert",
      cancelledAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL("/storniert?status=ok", _req.url));
}
