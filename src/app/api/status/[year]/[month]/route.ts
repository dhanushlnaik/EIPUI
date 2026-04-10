import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

mongoose.connect(process.env.MONGODB_URI as string).catch((error: any) => {
  console.error("Error connecting to database:", error?.message || error);
});

const statusChangeSchema = new mongoose.Schema({
  eip: { type: String, required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  changeDate: { type: Date, required: true },
  changedDay: { type: Number, required: true },
  changedMonth: { type: Number, required: true },
  changedYear: { type: Number, required: true },
});
const StatusChange = mongoose.models.StatusChange || mongoose.model("StatusChange", statusChangeSchema);

export async function GET(
  _request: Request,
  { params }: { params: { year: string; month: string } }
) {
  const yearNum = parseInt(params.year, 10);
  const monthNum = parseInt(params.month, 10);

  try {
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const statusChanges = await StatusChange.aggregate([
      { $match: { changeDate: { $gte: startDate, $lte: endDate }, status: { $ne: null } } },
      {
        $group: {
          _id: { status: "$status", month: { $month: "$changeDate" }, year: { $year: "$changeDate" } },
          eips: {
            $push: {
              category: "$category",
              month: { $month: "$changeDate" },
              year: { $year: "$changeDate" },
              date: { $concat: [{ $toString: { $year: "$changeDate" } }, "-", { $toString: { $month: "$changeDate" } }] },
              count: 1,
              eips: "$$ROOT",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          eips: {
            $push: {
              category: "$_id.category",
              month: "$_id.month",
              year: "$_id.year",
              date: { $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }] },
              count: { $sum: 1 },
              eips: "$eips",
            },
          },
        },
      },
      { $project: { _id: 0, status: "$_id", eips: 1 } },
      { $sort: { status: 1 } },
    ]);

    return NextResponse.json(statusChanges);
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
