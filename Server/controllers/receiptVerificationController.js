import { verifyReceipt } from "../services/chekiService.js";

export async function verifyReceiptController(req, res) {
    try {
        const { bank, reference, accountNumber } = req.body;

        if (
            typeof bank !== "string" ||
            !bank.trim() ||
            typeof reference !== "string" ||
            !reference.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Bank and receipt reference or URL are required.",
            });
        }

        if (
            accountNumber !== undefined &&
            (typeof accountNumber !== "string" ||
                !/^\d{8,20}$/.test(accountNumber))
        ) {
            return res.status(400).json({
                success: false,
                message: "Account number must contain 8–20 digits.",
            });
        }

        const result = await verifyReceipt({
            bank: bank.trim().toLowerCase(),
            reference: reference.trim(),
            accountNumber,
        });

        return res.status(200).json({
            success: true,
            verification: result.verified ? "VERIFIED" : "UNVERIFIED",
            message: result.verified
                ? "The bank confirmed this receipt."
                : "The receipt could not be confirmed. Further verification is required.",
            data: result,
        });
    } catch (error) {
        console.error("Receipt verification error:", error);

        return res.status(502).json({
            success: false,
            verification: "UNAVAILABLE",
            message:
                "Receipt verification is temporarily unavailable. Please try again or verify manually.",
        });
    }
}