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

type Ctx = { params: { year: string; month: string } };

export async function GET(_request: Request, context: Ctx) {
  const year = parseInt(context.params.year, 10);
  const month = parseInt(context.params.month, 10);

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const EipstatusChanges = await EipStatusChange.aggregate([
      {
        $match: {
          eip: { $nin: ["7212"] },
          changeDate: { $gte: startDate, $lte: endDate },
          category: {
            $ne: "ERC",
          },
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

    const RipstatusChanges = await RipStatusChange.aggregate([
      {
        $match: {
          changeDate: { $gte: startDate, $lte: endDate },
          category: {
            $ne: "ERC",
          },
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

    const eipFinal = EipstatusChanges?.map((item: any) => ({ ...item, repo: "eip" }));
    const ripFinal = RipstatusChanges?.map((item: any) => ({ ...item, repo: "rip" }));

    if (year === 2023 && month === 10) {
      const FrozenErcStatusChanges = await EipStatusChange.aggregate([
        {
          $match: {
            changeDate: { $gte: startDate, $lte: endDate },
            category: "ERC",
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

      const ercFrozenFinal = FrozenErcStatusChanges?.map((item: any) => ({
        ...item,
        repo: "erc",
      }));

      return NextResponse.json({
        eip: eipFinal,
        erc: ercFrozenFinal,
        rip: ripFinal,
      });
    }

    if (year < 2023 || (year === 2023 && month <= 11)) {
      const FrozenErcStatusChanges = await EipStatusChange.aggregate([
        {
          $match: {
            changeDate: { $gte: startDate, $lte: endDate },
            category: "ERC",
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

      const ercFrozenFinal = FrozenErcStatusChanges?.map((item: any) => ({
        ...item,
        repo: "erc",
      }));

      const ErcstatusChanges = await ErcStatusChange.aggregate([
        { $match: { changeDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: "$toStatus",
            count: { $sum: 1 },
            statusChanges: { $push: "$$ROOT" },
          },
        },
      ]);

      const ercFinal = ErcstatusChanges?.map((item: any) => ({ ...item, repo: "erc" }));

      return NextResponse.json({
        eip: eipFinal,
        erc: [...ercFinal, ...ercFrozenFinal],
        rip: ripFinal,
      });
    }

    const ErcstatusChanges = await ErcStatusChange.aggregate([
      { $match: { changeDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: "$toStatus",
          count: { $sum: 1 },
          statusChanges: { $push: "$$ROOT" },
        },
      },
    ]);

    const ercFinal = ErcstatusChanges?.map((item: any) => ({ ...item, repo: "erc" }));

    return NextResponse.json({ eip: eipFinal, erc: ercFinal, rip: ripFinal });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
