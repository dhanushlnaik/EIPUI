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

const categoryChangeSchema = new mongoose.Schema({
  eip: { type: String, required: true },
  fromCategory: { type: String, required: true },
  toCategory: { type: String, required: true },
  changeDate: { type: Date, required: true },
  changedDay: { type: Number, required: true },
  changedMonth: { type: Number, required: true },
  changedYear: { type: Number, required: true },
});

const EipCategoryChange =
  mongoose.models.EipCategoryChange ||
  mongoose.model("EipCategoryChange", categoryChangeSchema, "eipcategorychange3");

const ErcCategoryChange =
  mongoose.models.ErcCategoryChange ||
  mongoose.model("ErcCategoryChange", categoryChangeSchema, "erccategorychange3");

const RipCategoryChange =
  mongoose.models.RipCategoryChange ||
  mongoose.model("RipCategoryChange", categoryChangeSchema, "ripcategorychange3");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const EipfinalCategoryByYear = await EipCategoryChange.aggregate([
      { $match: { eip: { $nin: ["7212"] } } },
      { $sort: { eip: 1, changeDate: 1 } },
      {
        $group: {
          _id: { year: { $year: "$changeDate" }, eip: "$eip" },
          lastCategory: { $last: "$toCategory" },
          eipTitle: { $last: "$title" },
          eipStatus: { $last: "$status" },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          categoryChanges: {
            $push: {
              eip: "$_id.eip",
              lastCategory: "$lastCategory",
              eipTitle: "$eipTitle",
              eipStatus: "$eipStatus",
            },
          },
        },
      },
      { $project: { _id: 0, year: "$_id", categoryChanges: 1 } },
      { $sort: { year: 1 } },
    ]);

    const ErcfinalCategoryByYear = await ErcCategoryChange.aggregate([
      { $match: { changeDate: { $gte: new Date("2023-11-01T00:00:00.000Z") } } },
      { $sort: { eip: 1, changeDate: 1 } },
      {
        $group: {
          _id: { year: { $year: "$changeDate" }, eip: "$eip" },
          lastCategory: { $last: "$toCategory" },
          eipTitle: { $last: "$title" },
          eipStatus: { $last: "$status" },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          categoryChanges: {
            $push: {
              eip: "$_id.eip",
              lastCategory: "$lastCategory",
              eipTitle: "$eipTitle",
              eipStatus: "$eipStatus",
            },
          },
        },
      },
      { $project: { _id: 0, year: "$_id", categoryChanges: 1 } },
      { $sort: { year: 1 } },
    ]);

    const RipfinalCategoryByYear = await RipCategoryChange.aggregate([
      { $match: { changeDate: { $gte: new Date("2023-11-01T00:00:00.000Z") } } },
      { $sort: { eip: 1, changeDate: 1 } },
      {
        $group: {
          _id: { year: { $year: "$changeDate" }, eip: "$eip" },
          lastCategory: { $last: "$toCategory" },
          eipTitle: { $last: "$title" },
          eipStatus: { $last: "$status" },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          categoryChanges: {
            $push: {
              eip: "$_id.eip",
              lastCategory: "$lastCategory",
              eipTitle: "$eipTitle",
              eipStatus: "$eipStatus",
            },
          },
        },
      },
      { $project: { _id: 0, year: "$_id", categoryChanges: 1 } },
      { $sort: { year: 1 } },
    ]);

    const eipFinal = EipfinalCategoryByYear?.map((item: any) => ({
      ...item,
      repo: "eip",
    }));
    const ercFinal = ErcfinalCategoryByYear?.map((item: any) => ({
      ...item,
      repo: "erc",
    }));
    const ripFinal = RipfinalCategoryByYear?.map((item: any) => ({
      ...item,
      repo: "rip",
    }));

    return NextResponse.json({
      eip: eipFinal,
      erc: ercFinal,
      rip: ripFinal,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
