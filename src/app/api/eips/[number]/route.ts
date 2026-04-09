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

const EIPMdFiles =
  mongoose.models.EipMdFiles3 || mongoose.model("EipMdFiles3", mdFilesSchema);

export async function GET(
  _request: Request,
  { params }: { params: { number: string } }
) {
  const eipNumber = parseInt(params.number, 10);

  if (Number.isNaN(eipNumber)) {
    return NextResponse.json({ error: "Invalid EIP number" }, { status: 400 });
  }

  try {
    const eip = await EIPMdFiles.findOne({ eip: eipNumber });
    if (!eip) {
      return NextResponse.json({ error: "EIP not found" }, { status: 404 });
    }
    return NextResponse.json({ ...eip.toObject(), repo: "eip" });
  } catch (error: any) {
    console.error("Error retrieving EIP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
