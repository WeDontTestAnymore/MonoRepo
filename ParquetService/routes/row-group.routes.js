import express from "express";
const router = express.Router();

import { executeQuery } from "../utils/executeQuery.js";

router.get("/count", countRowGroups);
router.get("/countRows", countRows);
router.get("/stats", getStats);
router.get("/range", getRange);

async function countRowGroups(req, res) {
    try {
        const { config, tables3uri } = req.body;
       console.log(tables3uri);
        const query = `select count(distinct row_group_id) as rgcount from 
    parquet_metadata('${tables3uri}');  `;
       // console.log("query is : ",query);
        const count = await executeQuery(config,  query);
       // console.log("count is: ",count);
       const result = count[0];
        return res.status(500).json({count:result});
    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}



async function getStats(req, res) {
    try {
        const { config, tables3uri } = req.body;
        const query = `select row_group_id, avg(num_values),
        min(num_values),max(num_values) from parquet_metadata('${tables3uri}') group 
        by all; `;
        const count = await executeQuery(config, query);
        return res.status(500).json({ count });

    } catch (error) {
        console.log("error in getStats func : ", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}


async function countRows(req, res) {
    try {
        const { config, tables3uri } = req.body;
        const query = `select distinct row_group_id , row_group_num_rows from parquet_metadata('${tables3uri}');`;
        const count = await executeQuery(config, query);
        return res.status(500).json({ count });

    } catch (error) {
        console.log("error in countRows func : ", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getRange(req, res) {
    try {
        const { config, tables3uri } = req.body;
       const  query = `select column_id,type,stats_min,stats_max
        from parquet_metadata('${tables3uri}');`;

        console.log("query is : ",query);
        const count = await executeQuery(config, query);
        return res.status(500).json({ count });

    } catch (error) {
        console.log("error in getRange func : ", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}



export default router