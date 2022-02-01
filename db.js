const Pool = require("pg").Pool;

const pool = new Pool({
  user: "gvmtaizqrtpxds",
  password: "750c35638fe0ea0dacd267ec1914de01a798e5642617b3ba64cbc1c650b212b9",
  host: "ec2-44-194-112-166.compute-1.amazonaws.com",
  port: 5432,
  database: "dbct8fgkrhmsbe",
   ssl: {
        rejectUnauthorized: false,
  },
});

module.exports = pool;
