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

const statusChangeSchema = new mongoose.Schema({
  eip: {
    type: String,
    required: true,
  },
  fromStatus: {
    type: String,
    required: true,
  },
  toStatus: {
    type: String,
    required: true,
  },
  changeDate: {
    type: Date,
    required: true,
  },
  changedDay: {
    type: Number,
    required: true,
  },
  changedMonth: {
    type: Number,
    required: true,
  },
  changedYear: {
    type: Number,
    required: true,
  },
});

const EipStatusChange =
  mongoose.models.EipStatusChange3 ||
  mongoose.model("EipStatusChange3", statusChangeSchema, "eipstatuschange3");

const ErcStatusChange =
  mongoose.models.ErcStatusChange3 ||
  mongoose.model("ErcStatusChange3", statusChangeSchema, "ercstatuschange3");

const RipStatusChange =
  mongoose.models.RipStatusChange3 ||
  mongoose.model("RipStatusChange3", statusChangeSchema, "ripstatuschange3");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const eipResults = (await EipStatusChange.find({}))?.map((result: any) => ({
      ...result.toObject(),
      repo: "eip",
    }));

    const ercResults = (await ErcStatusChange.find({}))?.map((result: any) => ({
      ...result.toObject(),
      repo: "erc",
    }));

    const ripResults = (await RipStatusChange.find({}))?.map((result: any) => ({
      ...result.toObject(),
      repo: "rip",
    }));

    return NextResponse.json({
      eip: eipResults,
      erc: ercResults,
      rip: ripResults,
    });
  } catch {
    return NextResponse.json(
      { error: "Error fetching status changes" },
      { status: 500 }
    );
  }
}
