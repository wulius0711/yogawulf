import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { renderInvoiceHtml } from "@/lib/invoiceTemplate";
import { loadConfigFromDB } from "@/lib/loadConfig";
import type { InvoiceLineItem, InquiryFormData } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Nicht eingeloggt", { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { slug: session.clientSlug }, select: { id: true } });
  if (!client) return new NextResponse("Client nicht gefunden", { status: 404 });

  const invoice = await prisma.invoice.findFirst({
    where: { id, clientId: client.id },
    include: { inquiry: true },
  });
  if (!invoice) return new NextResponse("Nicht gefunden", { status: 404 });

  const config = await loadConfigFromDB(session.clientSlug);
  const inquiryData = JSON.parse(invoice.inquiry.data) as InquiryFormData;

  const html = renderInvoiceHtml({
    number: invoice.number,
    issuedAt: invoice.issuedAt,
    validUntil: invoice.validUntil,
    notes: invoice.notes,
    lineItems: JSON.parse(invoice.lineItems) as InvoiceLineItem[],
    taxRate: invoice.taxRate,
    config,
    recipientName: inquiryData.nameGruppenleitung,
    recipientEmail: inquiryData.email,
    eventTitle: inquiryData.artTitel,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
