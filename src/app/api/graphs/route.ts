import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureConnection() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");
  await mongoose.connect(uri);
}

const statusChangeSchema = new mongoose.Schema({
  eip: { type: String, required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  changeDate: { type: Date, required: true },
  changedDay: { type: Number, required: true },
  changedMonth: { type: Number, required: true },
  changedYear: { type: Number, required: true },
});

const StatusChange =
  mongoose.models.StatusChange || mongoose.model("StatusChange", statusChangeSchema);

export async function GET() {
  try {
    await ensureConnection();
    const result = await StatusChange.aggregate([
      {
        $group: {
          _id: {
            status: "$status",
            category: "$category",
            changedYear: { $year: "$changeDate" },
            changedMonth: { $month: "$changeDate" },
          },
          count: { $sum: 1 },
          eips: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: "$_id.status",
          eips: {
            $push: {
              category: "$_id.category",
              changedYear: "$_id.changedYear",
              changedMonth: "$_id.changedMonth",
              count: "$count",
              eips: "$eips",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedResult = result?.map((group: any) => ({
      status: group._id,
      eips: group.eips
        ?.reduce((acc: any[], eipGroup: any) => {
          const { category, changedYear, changedMonth, count } = eipGroup;
          acc.push({
            category,
            month: changedMonth,
            year: changedYear,
            date: `${changedYear}-${changedMonth}`,
            count,
          });
          return acc;
        }, [])
        .sort((a: any, b: any) => (a.date > b.date ? 1 : -1)),
    }));

    return NextResponse.json(formattedResult);
  } catch (error: any) {
    console.error("Error retrieving EIPs:", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
