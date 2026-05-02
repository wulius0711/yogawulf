import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

function serialize(p: {
  id: string; name: string; description: string; pricePerPerson: number;
  minParticipants: number; maxParticipants: number; durationDays: number;
  isActive: boolean; sortOrder: number;
}) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    pricePerPerson: p.pricePerPerson,
    minParticipants: p.minParticipants,
    maxParticipants: p.maxParticipants,
    durationDays: p.durationDays,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  };
}

async function getClientId(slug: string) {
  const client = await prisma.client.findUnique({ where: { slug }, select: { id: true } });
  return client?.id ?? null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const clientId = await getClientId(session.clientSlug);
  if (!clientId) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  const packages = await prisma.package.findMany({
    where: { clientId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(packages.map(serialize));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const clientId = await getClientId(session.clientSlug);
  if (!clientId) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  const body = await req.json();
  const { name, description, pricePerPerson, minParticipants, maxParticipants, durationDays, isActive, sortOrder } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }

  const pkg = await prisma.package.create({
    data: {
      clientId,
      name: name.trim(),
      description: description ?? "",
      pricePerPerson: Number(pricePerPerson) || 0,
      minParticipants: Number(minParticipants) || 1,
      maxParticipants: Number(maxParticipants) || 50,
      durationDays: Number(durationDays) || 1,
      isActive: isActive !== false,
      sortOrder: Number(sortOrder) || 0,
    },
  });

  return NextResponse.json(serialize(pkg));
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const clientId = await getClientId(session.clientSlug);
  if (!clientId) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  const body = await req.json();
  const { id, name, description, pricePerPerson, minParticipants, maxParticipants, durationDays, isActive, sortOrder } = body;

  const existing = await prisma.package.findFirst({ where: { id, clientId } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const updated = await prisma.package.update({
    where: { id },
    data: {
      name: name?.trim() ?? existing.name,
      description: description ?? existing.description,
      pricePerPerson: pricePerPerson !== undefined ? Number(pricePerPerson) : existing.pricePerPerson,
      minParticipants: minParticipants !== undefined ? Number(minParticipants) : existing.minParticipants,
      maxParticipants: maxParticipants !== undefined ? Number(maxParticipants) : existing.maxParticipants,
      durationDays: durationDays !== undefined ? Number(durationDays) : existing.durationDays,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
    },
  });

  return NextResponse.json(serialize(updated));
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const clientId = await getClientId(session.clientSlug);
  if (!clientId) return NextResponse.json({ error: "Client nicht gefunden" }, { status: 404 });

  const { id } = await req.json();
  await prisma.package.deleteMany({ where: { id, clientId } });

  return NextResponse.json({ ok: true });
}
