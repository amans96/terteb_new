import { Cheki, isVerified } from "cheki-verify";

const cheki = new Cheki("https://cheki.et");

export async function verifyReceipt({
    bank,
    reference,
    accountNumber,
}) {
    const options = accountNumber ? { accountNumber } : undefined;

    const result = await cheki.verify(
        bank,
        reference,
        options
    );

    return {
        verified: isVerified(result),
        bank: result.bank ?? bank,
        reference: result.reference ?? reference,
        amount: result.amount ?? null,
        currency: result.currency ?? null,
        senderName: result.senderName ?? null,
        receiverName: result.receiverName ?? null,
        date: result.date ?? null,
        sourceUrl: result.sourceUrl ?? null,
    };
}