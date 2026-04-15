import { NextResponse } from "next/server";

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error.message);
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

const statusChangeSchema = new mongoose.Schema({
  eip: { type: String, required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  changeDate: { type: Date, required: true },
});

const MdFiles = mongoose.models.MdFiles || mongoose.model("MdFiles", mdFilesSchema);
const StatusChange =
  mongoose.models.EipStatusChange3 ||
  mongoose.model("EipStatusChange3", statusChangeSchema, "eipstatuschange3");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { eip: string } };

export async function GET(_request: Request, context: Ctx) {
  const eipNumber = parseInt(context.params.eip, 10);

  try {
    const eip = await MdFiles.findOne({ eip: eipNumber });

    if (!eip) {
      return NextResponse.json({ error: "EIP not found" }, { status: 404 });
    }

    const createdDate = new Date(eip.created);

    const firstFinalStatus = await StatusChange.findOne({
      eip: eipNumber,
      toStatus: { $in: ["Final", "Withdrawn"] },
    }).sort({ changeDate: 1 });

    if (!firstFinalStatus) {
      return NextResponse.json({ error: "Final status not found" }, { status: 404 });
    }

    const finalStatusDate = new Date(firstFinalStatus.changeDate);
    const timeDifference = finalStatusDate.getTime() - createdDate.getTime();
    const daysToFinal = timeDifference / (1000 * 60 * 60 * 24);

    return NextResponse.json({ eipNumber, daysToFinal, createdDate, finalStatusDate });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
