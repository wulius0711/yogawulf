import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json([], { status: 200 });

  const client = await prisma.client.findUnique({ where: { slug }, select: { id: true } });
  if (!client) return NextResponse.json([], { status: 200 });

  const packages = await prisma.package.findMany({
    where: { clientId: client.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      pricePerPerson: true,
      minParticipants: true,
      maxParticipants: true,
      durationDays: true,
    },
  });

  return NextResponse.json(packages);
}
