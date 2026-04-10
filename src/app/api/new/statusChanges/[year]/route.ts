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

const mergeStatusBuckets = (buckets: any[]) => {
  const map: Record<string, { _id: string; count: number; statusChanges: any[] }> = {};

  buckets.forEach((b) => {
    const key = String(b._id);
    if (!map[key]) {
      map[key] = {
        _id: key,
        count: 0,
        statusChanges: [],
      };
    }
    map[key].count += b.count ?? 0;
    if (Array.isArray(b.statusChanges)) {
      map[key].statusChanges.push(...b.statusChanges);
    }
  });

  return Object.values(map);
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { year: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const year = parseInt(context.params.year, 10);

    if (Number.isNaN(year)) {
      return NextResponse.json({ error: "Invalid year in URL" }, { status: 400 });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0);

    const eipBuckets = await EipStatusChange.aggregate([
      {
        $match: {
          eip: { $nin: ["7212"] },
          changeDate: { $gte: startDate, $lte: endDate },
          category: { $ne: "ERC" },
        },
      },
      {
        $group: {
          _id: "$toStatus",
          count: { $sum: 1 },
          statusChanges: { $push: "$$ROOT" },
        },
      },
    ]);

    const eipFinal = eipBuckets?.map((item: any) => ({
      ...item,
      repo: "eip",
    }));

    const ercFromEip = await EipStatusChange.aggregate([
      {
        $match: {
          changeDate: { $gte: startDate, $lte: endDate },
          category: { $in: ["ERC", "ERCs", "Standards Track - ERC"] },
        },
      },
      {
        $group: {
          _id: "$toStatus",
          count: { $sum: 1 },
          statusChanges: { $push: "$$ROOT" },
        },
      },
    ]);

    const ercFromErc = await ErcStatusChange.aggregate([
      {
        $match: {
          changeDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$toStatus",
          count: { $sum: 1 },
          statusChanges: { $push: "$$ROOT" },
        },
      },
    ]);

    const mergedErcBuckets = mergeStatusBuckets([...(ercFromEip || []), ...(ercFromErc || [])]);

    const ercFinal = mergedErcBuckets?.map((item: any) => ({
      ...item,
      repo: "erc",
    }));

    const ripBuckets = await RipStatusChange.aggregate([
      {
        $match: {
          changeDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$toStatus",
          count: { $sum: 1 },
          statusChanges: { $push: "$$ROOT" },
        },
      },
    ]);

    const ripFinal = ripBuckets?.map((item: any) => ({
      ...item,
      repo: "rip",
    }));

    return NextResponse.json({
      eip: eipFinal,
      erc: ercFinal,
      rip: ripFinal,
    });
  } catch (error) {
    console.error("Error in yearly statusChanges route:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
