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

const eipcontentsSchema = new mongoose.Schema({
  eip: {
    type: Number,
  },
  content: { type: String },
});

const erc_contents =
  mongoose.models.erc_contents ||
  mongoose.model("erc_contents3", eipcontentsSchema);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { num: string } };

export async function GET(_request: Request, context: Ctx) {
  const eipNumber = parseInt(context.params.num, 10);

  try {
    const erc = await erc_contents.findOne({ eipNumber });

    if (!erc) {
      return NextResponse.json({ message: "EIP not found" }, { status: 404 });
    }

    return NextResponse.json({ ...erc.toObject(), repo: "erc" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
