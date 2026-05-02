import { prisma } from "@/lib/db";

export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `angebot-${year}`;

  const result = await prisma.$transaction(async (tx) => {
    const row = await tx.invoiceCounter.upsert({
      where: { id: key },
      update: { counter: { increment: 1 } },
      create: { id: key, counter: 1 },
    });
    return row.counter;
  });

  return `ANB-${year}-${String(result).padStart(4, "0")}`;
}
