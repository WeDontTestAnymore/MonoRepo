export const randGen = (dataType) => {
    switch (dataType.toUpperCase()) {
        case "INTEGER":
        case "INT":
        case "BIGINT":
        case "SMALLINT":
        case "TINYINT":
            return Math.floor(Math.random() * 1000); // Random integer from 0 to 999

        case "FLOAT":
        case "DOUBLE":
        case "DECIMAL":
        case "REAL":
            return (Math.random() * 1000).toFixed(2); // Random float with 2 decimals

        case "STRING":
        case "TEXT":
        case "VARCHAR":
        case "CHAR":
            return Math.random().toString(36).substring(2, 8); // Random alphanumeric string

        case "BOOLEAN":
            return Math.random() < 0.5; // Random true or false

        case "DATE":
            return new Date(Date.now() - Math.floor(Math.random() * 10000000000))
                .toISOString()
                .split("T")[0]; // Random date in YYYY-MM-DD format

        case "TIMESTAMP":
        case "DATETIME":
            return new Date(Date.now() - Math.floor(Math.random() * 10000000000))
                .toISOString(); // Random timestamp in ISO format

        default:
            return "UNKNOWN"; // Fallback for unsupported data types
    }
};
