import { NextResponse } from "next/server";
import mongoose from "mongoose";

const mongoUri: string = process.env.MONGODB_URI as string;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const dbName = 'test'; // Specify the database name

mongoose
  .connect(mongoUri) // Connect to the specified database
  .then(() => {
    console.log(`Connected to the database`);
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error.message);
  });

// Schema for collections
const fulldataSchema = new mongoose.Schema({}, { strict: false }); // Schema allows any fields

// Models for eip_board_fulldata and erc_board_fulldata
const EipBoardFullData = mongoose.models.EipBoardFullData || mongoose.model("EipBoardFullData", fulldataSchema, 'eip_board_alldata');
const ErcBoardFullData = mongoose.models.ErcBoardFullData || mongoose.model("ErcBoardFullData", fulldataSchema, 'erc_board_alldata');

export async function GET() {
  try {
    // Retrieve data from eip_board_fulldata and erc_board_fulldata
    const [eips, ercs] = await Promise.all([
      EipBoardFullData.find(), // Retrieve all EIP data
      ErcBoardFullData.find(), // Retrieve all ERC data
    ]);

    // Send the response with the data for EIPs and ERCs
    return NextResponse.json({
      eips,
      ercs,
    });
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
