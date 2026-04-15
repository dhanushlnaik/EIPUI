import { NextResponse } from "next/server";

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
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

const RIPMdFiles =
  mongoose.models.RipMdFiles3 || mongoose.model("RipMdFiles3", mdFilesSchema);

export async function GET(
  _request: Request,
  { params }: { params: { num: string } }
) {
  const eipNumber = parseInt(params.num, 10);

  if (Number.isNaN(eipNumber)) {
    return NextResponse.json({ error: "Invalid RIP number" }, { status: 400 });
  }

  try {
    const eip = await RIPMdFiles.findOne({ eip: eipNumber });
    if (!eip) {
      return NextResponse.json({ error: "EIP not found" }, { status: 404 });
    }
    return NextResponse.json({ ...eip.toObject(), repo: "rip" });
  } catch (error: any) {
    console.error("Error retrieving EIP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
