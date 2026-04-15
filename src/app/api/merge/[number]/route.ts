import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

mongoose.connect(process.env.MONGODB_URI as string).catch((error: any) => {
  console.error("Error connecting to database:", error?.message || error);
});

const mdFilesSchema = new mongoose.Schema({
  eip: { type: String, unique: true },
  title: { type: String },
  author: { type: String },
  status: { type: String },
  type: { type: String },
  category: { type: String },
  created: { type: String },
});

const eipHistorySchema = new mongoose.Schema({
  eip: { type: String },
  mergedMonth: { type: Number },
  mergedYear: { type: Number },
  mergedDate: { type: Date },
});

const MdFiles = mongoose.models.MdFiles || mongoose.model("MdFiles", mdFilesSchema);
const EipHistory = mongoose.models.EipHistory || mongoose.model("EipHistory", eipHistorySchema);

export async function GET(
  _request: Request,
  { params }: { params: { number: string } }
) {
  const eipNumber = parseInt(params.number, 10);

  try {
    const eip = await MdFiles.findOne({ eip: eipNumber }).exec();
    const latestMergeDate = await EipHistory.findOne({ eip: eipNumber })
      .sort({ mergedDate: -1 })
      .exec();

    if (!eip || !latestMergeDate) {
      return NextResponse.json({ error: "EIP not found" }, { status: 404 });
    }

    return NextResponse.json({
      EIP: `${eip}${latestMergeDate.mergedMonth}${latestMergeDate.mergedYear}`,
    });
  } catch (error) {
    console.error("Error retrieving EIP merge data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
