import express from "express";
const router = express.Router();

import connection from "./dbConnection"; 

router.get("/count", countRowGroups);
router.get("/countRows",countRows);
router.get("/stats",getStats);
router.get("/range",getRange);

async function countRowGroups(req, res) {
    try {
        const { config, tables3uri} = req.body;
        query = "";
        const count = executeQuery(config,tables3uri,query);
        res.status(500).json({count});
        async function countRows(req, res) {
            try {
                const { config, tables3uri} = req.body;
                query = "";
                const count = executeQuery(config,tables3uri,query);
                res.status(500).json({count});
                
            } catch (error) {
                console.log("error in countRowGroups func : ", error.message);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}



async function getStats(req, res) {
    try {
        const { config, tables3uri} = req.body;
        query = "";
        const count = executeQuery(config,tables3uri,query);
        res.status(500).json({count});
        
    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


async function countRows(req, res) {
    try {
        const { config, tables3uri} = req.body;
        query = `selct row_group_id, avg(num_values),
        min(num_values),max(num_values) from parquet_metadata(${tables3uri} group 
        by all;) `;
        const count = executeQuery(config,tables3uri,query);
        res.status(500).json({count});
        
    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getRange(req, res) {
    try {
        const { config, tables3uri} = req.body;
        query =   `select column_id,type,stats_min,stats_max
        from parquet_metadata(${tables3uri})`;
        const count = executeQuery(config,tables3uri,query);
        res.status(500).json({count});
        
    } catch (error) {
        console.log("error in countRowGroups func : ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}



