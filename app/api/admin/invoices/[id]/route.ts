import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json() as { status: string };
  const allowed = ["offen", "storniert"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  const invoice = await prisma.invoice.findFirst({ where: { id, clientId: client.id } });
  if (!invoice) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const updated = await prisma.invoice.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, status: updated.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  await prisma.invoice.deleteMany({ where: { id, clientId: client.id } });
  return NextResponse.json({ ok: true });
}
