import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const inquiries = await prisma.inquiry.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json() as { id: string; status: string };
  const allowed = ["neu", "in_pruefung", "bestaetigt", "abgelehnt"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const inquiry = await prisma.inquiry.findFirst({ where: { id, clientId: client.id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.inquiry.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json() as { id: string };
  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const inquiry = await prisma.inquiry.findFirst({ where: { id, clientId: client.id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
