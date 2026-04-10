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

const rip_contents =
  mongoose.models.rip_contents ||
  mongoose.model("rip_contents3", eipcontentsSchema);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { num: string } };

export async function GET(_request: Request, context: Ctx) {
  const eipNumber = parseInt(context.params.num, 10);

  try {
    const rip = await rip_contents.findOne({ eipNumber });

    if (!rip) {
      return NextResponse.json({ message: "EIP not found" }, { status: 404 });
    }

    return NextResponse.json({ ...rip.toObject(), repo: "rip" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
