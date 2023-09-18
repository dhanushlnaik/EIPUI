import { Request, Response } from 'express';
import { Octokit } from "@octokit/rest";

const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((error: any) => {
        console.error('Error connecting to the database:', error.message);
    });

    const eipHistorySchema = new mongoose.Schema({
        eip: { type: String } ,
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
        // createdDate: { type: Date },
        createdMonth: { type: Number },
        createdYear: { type: Number },
        previousdeadline: { type: String },
        newdeadline: { type: String },
        message: { type: String },
    });
    
    
const EipHistory = mongoose.models.EipHistory ||  mongoose.model('EipHistory', eipHistorySchema);


export default async (req: Request, res: Response) => {
    const parts = req.url.split("/");
    const eipNumber = parseInt(parts[3]);

    try {
    
        if (isNaN(eipNumber)) {
          return res.status(400).json({ message: 'Invalid EIP number' });
        }
    
        const eipHistory = await EipHistory.find({ eip: eipNumber });
    
        res.json(eipHistory);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
      }
};

