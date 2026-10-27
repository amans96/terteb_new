
import {
    getProfitData,
    getDailyProfitData,
} from "../services/profitService.js";

export const getProfitSummary = async (req, res) => {
    try {
        const report = await getProfitData({
            period: req.query.period || "daily",
            from: req.query.from,
            to: req.query.to,
        });

        return res.json(report);
    } catch (error) {
        console.error("PROFIT SUMMARY ERROR:", error);

        return res.status(400).json({
            message: error.message || "Failed to calculate profit.",
        });
    }
};

export const getDailyProfitReport = async (req, res) => {
    try {
        const report = await getDailyProfitData({
            period: req.query.period || "monthly",
            from: req.query.from,
            to: req.query.to,
        });

        return res.json(report);
    } catch (error) {
        console.error("DAILY PROFIT REPORT ERROR:", error);

        return res.status(400).json({
            message: error.message || "Failed to calculate daily profit.",
        });
    }
};
