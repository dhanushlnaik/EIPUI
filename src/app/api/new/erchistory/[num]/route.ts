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

const eipHistorySchema = new mongoose.Schema({
  eip: { type: String },
  title: { type: String },
  author: { type: String },
  status: { type: String },
  type: { type: String },
  category: { type: String },
  created: { type: Date },
  discussion: { type: String },
  deadline: { type: String },
  requires: { type: String },
  commitSha: { type: String },
  commitDate: { type: Date },
  mergedDate: { type: Date },
  prNumber: { type: Number },
  closedDate: { type: Date },
  changes: { type: Number },
  insertions: { type: Number },
  deletions: { type: Number },
  mergedDay: { type: Number },
  mergedMonth: { type: Number },
  mergedYear: { type: Number },
  createdMonth: { type: Number },
  createdYear: { type: Number },
  previousdeadline: { type: String },
  newdeadline: { type: String },
  message: { type: String },
});

const ErcHistory =
  mongoose.models.ErcHistory || mongoose.model("ErcHistory3", eipHistorySchema);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { num: string } };

export async function GET(_request: Request, context: Ctx) {
  const eipNumber = parseInt(context.params.num, 10);

  try {
    if (Number.isNaN(eipNumber)) {
      return NextResponse.json({ message: "Invalid EIP number" }, { status: 400 });
    }

    const ercHistory = await ErcHistory.find({ eip: eipNumber });

    return NextResponse.json({ ...ercHistory, repo: "erc" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
