import mysql from "mysql2";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import dotenv from "dotenv";
import { data } from "react-router-dom";
import fs from "fs"

dotenv.config();
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "✅ Frontend Client connected: (ID)", socket.id);

  socket.on("disconnect", () => {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "❌ Frontend Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`${formatDateWithOffset()} | DEBUG | ` + `🚀  Server running on port ${PORT}`);
});





// server.listen(5000, () => {
//   console.log(`${formatDateWithOffset()} | DEBUG | ` + "Server running on port 5000");
// });



// Create connection to the database
const con = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "",
    database: "simulatorbank"
})

//check database connection
con.connect(function(err) {
    if (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "❌ Unable to connect to SimulatorBank Database");
        
    } else {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "✅ Successfuly connected to SimulatorBank Database"); 
    }
})

// app.use("/auth", adminRouter);

let bic = process.env.BIC;
let accessToken = "";
let refreshToken = "";

// let creditorName = "";
let debitorName = "Yitbarek";
let TxId = "";

let verificationBody = "";
let returnPaymentBody = "";
let statusQueryBody = "";
let pushpaymentBody = "";
let normalRTPBody = "";
let blankRTPBody = "";
let cancelRTPBody = "";
let RTPInfoBody = "";
let verificationResponseBody = "";
let pushPaymentResponseBody = "";
let RequestToPayResponseBody = "";
let returnPaymentResponseBody = "";

let OrgnlPmtInfId = "";
let OrgnlInstrId = "";
let OrgnlMsgId = "";

let acmt023Header = "";
let acmt023Body = "";
let pacs008Header = "";
let pacs008Body = "";
let pain014Header = "";
let pain014Body = "";

let errorcode = "";

let RTPExpiredTime = ''

const PRIVATE_KEY = fs.readFileSync("./private.key", "utf8");


function formatDateWithOffset(date = new Date()) {
  let pad = (n, z = 2) => String(n).padStart(z, "0");

  let year = date.getFullYear();
  let month = pad(date.getMonth() + 1);
  let day = pad(date.getDate());
  let hours = pad(date.getHours());
  let minutes = pad(date.getMinutes());
  let seconds = pad(date.getSeconds());
  let milliseconds = pad(date.getMilliseconds(), 3);

  let offset = -date.getTimezoneOffset();
  let sign = offset >= 0 ? "+" : "-";
  let offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  let offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${sign}${offsetHours}:${offsetMinutes}`;
}

function formatDateWithZRTP(date = new Date()) {
  let pad = (n, z = 2) => String(n).padStart(z, "0");

  let year = date.getUTCFullYear();
  let month = pad(date.getUTCMonth() + 1);
  let day = pad(date.getUTCDate());
  let hours = pad(date.getUTCHours());
  let minutes = pad(date.getUTCMinutes());
  let seconds = pad(date.getUTCSeconds());
  let milliseconds = pad(date.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}


app.post("/queryCustomers", (req, res) => {

const sql = `SELECT
  CONCAT(c.first_name, ' ', c.last_name) AS full_name,
  c.status,
  c.id,
  a.account_number AS account_no,
  a.currency,
  a.balance,
  c.phone_number AS phone,
  c.email,
  c.created_at
FROM accounts a
JOIN customers c
  ON a.owner_id = c.id
WHERE a.owner_type = 'CUSTOMER'
ORDER BY c.id DESC;`;

con.query(sql, (err, result) => {
    if (err) {
      console.error(`${formatDateWithOffset()} | ERROR | ` + "❌ Database Query Customer Info Error:", err);
      return res.status(500).json({ message: "Database Query Customer Info Error" });
    }

    console.log(`${formatDateWithOffset()} | DEBUG | ` + `✅ ${result.length} customer account(s) found`);
    return res.json(result); // <-- all rows returned
  });
});


app.post("/queryCustByTd", (req, res) => {

const sql = `SELECT
  CONCAT(c.first_name, ' ', c.last_name) AS full_name,
  c.status,
  c.id,
  a.account_number AS account_no,
  a.currency,
  a.balance,
  c.phone_number AS phone,
  c.email,
  c.created_at
FROM accounts a
JOIN customers c
  ON a.owner_id = c.id
WHERE a.owner_type = 'CUSTOMER'
AND a.account_number = '${req.body.custId}'
ORDER BY c.id DESC;`;

con.query(sql, (err, result) => {
    if (err) {
      console.error(`${formatDateWithOffset()} | ERROR | ` + "❌ Database Query Customer Info Error: ", err);
      return res.status(500).json({ message: "Database Query Customer Info Error" });
    }

    console.log(`${formatDateWithOffset()} | DEBUG | ` + `✅ ${req.body.custId} customer account(s) found`);
    return res.json(result); // <-- all rows returned
  });
});


app.post("/updateRTPDebitorInfo", (req, res) => {

  const { UETR, debitorAccount, debitorName, debitorBank } = req.body;

  con.beginTransaction((err) => {
    if (err) return res.json({ message: "Transaction start failed", error: err });

    // 1️⃣ Get internal transaction ID
    const getIdSql = `SELECT id FROM transactions WHERE transaction_id = ?`;

    con.query(getIdSql, [UETR], (err, result) => {
      if (err) {
        return con.rollback(() => {
          res.json({ message: "Error fetching transaction", error: err });
        });
      }

      if (result.length === 0) {
        return con.rollback(() => {
          res.json({ message: "Transaction not found" });
        });
      }

      const transactionId = result[0].id;
      const updateSql = `
        UPDATE transaction_parties
        SET account_number = ?,
            party_name = ?,
            bank_code = ?
        WHERE transaction_id = ?
        AND party_role = 'DEBTOR'
      `;

      con.query(
        updateSql,
        [debitorAccount, debitorName, debitorBank, transactionId],
        (err, result) => {
          if (err) {
            return con.rollback(() => {
              res.json({ message: "❌ Error updating debtor info", error: err });
            });
          }

          if (result.affectedRows === 0) {
            return con.rollback(() => {
              res.json({ message: "No DEBTOR record found to update" });
            });
          }

          con.commit((err) => {
            if (err) {
              return con.rollback(() => {
                res.json({ message: "❌ Commit failed", error: err });
              });
            }

            res.json({ message: "✅ Debitor updated successfully" });
          });
        }
      );

    });
  });
});




app.post("/updateRTPStatus", (req, res) => {

const sql = `UPDATE transactions 
SET status = '${req.body.txStatus}'
WHERE transaction_id = '${req.body.UETR}';`;

con.query(sql, (err, result) => {
    if (err){ 
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Update Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ RTP Updated Successfully."});
      return res.json({
            message: "success",
          });
    }
  }); 

  con.commit((err) => {
    if (err) {
      return con.rollback(() => {
        res.json({ message: "❌ Commit failed: " + err });
      });
    }
    console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ RTP Statu Updated Successfully."});
  });
});


app.post("/updateTxStatus", (req, res) => {

const sql = `UPDATE transactions 
SET status = 'RETURNED'
WHERE transaction_id = '${req.body.TxId}';`;

con.query(sql, (err, result) => {
    if (err){ 
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Update Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ Transaction Updated Successfully."});
    } 
  }); 

  con.commit((err) => {
    if (err) {
      return con.rollback(() => {
        res.json({ message: "❌ Commit failed: " + err });
      });
    }

    res.json({ success: "✅ Committed!"});
    console.log("✅ Committed!");
  });
});


app.post("/queryDebitor", (req, res) => {

const sql = `SELECT a.owner_id, a.owner_type, CONCAT(c.first_name, ' ', c.last_name) AS owner_name, a.status
FROM accounts a
JOIN customers c ON a.owner_id = c.id
WHERE a.account_number = '${req.body.debitorAccount}'
  AND a.owner_type = 'CUSTOMER'

UNION ALL

SELECT a.owner_id, a.owner_type, m.business_name AS owner_name, m.status
FROM accounts a
JOIN merchants m ON a.owner_id = m.id
WHERE a.account_number = '${req.body.debitorAccount}'
  AND a.owner_type = 'MERCHANT';`;

con.query(sql, (err, result) => {
    if (err){ 
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Query Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ Debitor Verified Successfully."});
      console.log(`${formatDateWithOffset()} | DEBUG | ` + result.map(row => row.owner_name));
      return res.json(result.map(row => row.owner_name));
    }
  }); 
});


app.post("/queryCreditor", (req, res) => {

const sql = `SELECT a.owner_id, a.owner_type, CONCAT(c.first_name, ' ', c.last_name) AS owner_name, a.status
FROM accounts a
JOIN customers c ON a.owner_id = c.id
WHERE a.account_number = '${req.body.debitorAccount}'
  AND a.owner_type = 'CUSTOMER'

UNION ALL

SELECT a.owner_id, a.owner_type, m.business_name AS owner_name, m.status
FROM accounts a
JOIN merchants m ON a.owner_id = m.id
WHERE a.account_number = '${req.body.debitorAccount}'
  AND a.owner_type = 'MERCHANT';`;

con.query(sql, (err, result) => {
    if (err){ 
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Query Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ User Status extracted Successfully."});
      console.log(`${formatDateWithOffset()} | DEBUG | ` + result.map(row => row.status));
      return res.json(result.map(row => row.status));
    }
  }); 
});


app.post("/fetch_TxnRecord", (req, res) => {
   
  const sql = `
    SELECT
      t.transaction_id,
      t.transaction_type,
      t.transaction_time,
      t.status,
      t.payment_method,
      t.channel,
      t.updated_at,
      a.total_amount,
      a.currency,
      i.account_number AS initiator_account,
      i.bank_code AS initiator_bank,
      d.account_number AS debtor_account,
      d.bank_code AS debtor_bank,
      c.account_number AS creditor_account,
      c.bank_code AS creditor_bank,
      i.bank_code AS initiator_bank
    FROM transactions t
    JOIN transaction_amounts a ON t.id = a.transaction_id
    JOIN transaction_parties d 
      ON t.id = d.transaction_id AND d.party_role = 'DEBTOR'
    JOIN transaction_parties c 
      ON t.id = c.transaction_id AND c.party_role = 'CREDITOR'
    JOIN transaction_parties i 
      ON t.id = i.transaction_id AND i.party_role = 'INITIATOR'
      ORDER BY t.created_at DESC`;

  con.query(sql, (err, result) => {
    if (err){
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Query Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ Query from Transaction Table Successful." });
      return res.json(result);
    }
  }); 
});


app.post("/fetchTxnById", (req, res) => {
   
  const sql = `
    SELECT
      t.transaction_id,
      t.transaction_type,
      t.transaction_time,
      t.status,
      t.payment_method,
      t.channel,
      t.updated_at,
      a.total_amount,
      a.currency,
      i.account_number AS initiator_account,
      i.bank_code AS initiator_bank,
      d.account_number AS debtor_account,
      d.bank_code AS debtor_bank,
      c.account_number AS creditor_account,
      c.bank_code AS creditor_bank,
      i.bank_code AS initiator_bank
    FROM transactions t
    JOIN transaction_amounts a ON t.id = a.transaction_id
    JOIN transaction_parties d 
      ON t.id = d.transaction_id AND d.party_role = 'DEBTOR'
    JOIN transaction_parties c 
      ON t.id = c.transaction_id AND c.party_role = 'CREDITOR'
    JOIN transaction_parties i 
      ON t.id = i.transaction_id AND i.party_role = 'INITIATOR'
      WHERE t.transaction_id = '${req.body.id}'
      ORDER BY t.created_at DESC`;

  con.query(sql, (err, result) => {
    if (err){
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { message: "❌ Database Query Error : " + err });
      return res.json({ message: "Database Query Error : " + err });
    }
    else{
      console.log(`${formatDateWithOffset()} | DEBUG | ` + { success: "✅ Transaction Query Successful. (ID)" +  req.body.id});
      return res.json(result);
    }
  }); 
});

app.post("/addCustomer", (req, res) => {

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************")
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Start to register the customer")
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************")
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "FirstName : " + req.body.firstname)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "LastName : " + req.body.lastname)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "type : " + req.body.type)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "status : " + req.body.status)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "phone : " + req.body.phone)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "email : " + req.body.email)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Currency : " + req.body.currency)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Account : " + req.body.account)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "NID : " + req.body.nid)
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************")

  const sql1 = `
    INSERT INTO customers
    (customer_code, first_name, last_name, phone_number, email, customer_type, status, national_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  con.query(
    sql1,
    [
      req.body.phone,
      req.body.firstname,
      req.body.lastname,
      req.body.phone,
      req.body.email,
      req.body.type,
      req.body.status,
      req.body.nid
    ],
    (err, result) => {
      if (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "❌ Customers Registration error:", err);
        return res.status(500).json({ message: "Customer Registration failed" });
      }

      const customerId = result.insertId;
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "✅ Customer created : (Cus-Id) = ", customerId);

      const sql3 = `
        INSERT INTO accounts
        (account_number, owner_type, owner_id, account_type, currency, balance)
        VALUES (?, 'CUSTOMER', ?, 'WALLET', ?, 5000.00)
      `;

      con.query(
        sql3,
        [req.body.account, customerId, req.body.currency],
        (err, result) => {
          if (err) {
            console.error(`${formatDateWithOffset()} | ERROR | ` + "❌ Accounts creation error:", err);
            return res.status(500).json({ message: "fail" });
          }

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "✅ Account is created :  (acc-Id) = ", result.insertId);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Registration completed")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************")
          return res.json({
            message: "success",
            customerId,
            accountId: result.insertId
          });
        }
      );

      con.commit((err) => {
        if (err) {
          return con.rollback(() => {
            res.json({ message: "❌ Commit failed: " + err });
          });
        }

        res.json({ success: "✅ Commited!"});
      });
    }
  );
});



const SECRET_KEY = "common_secret_key";

app.post("/Login", (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT username
    FROM users
    WHERE username = ? AND password = ?
  `;

  con.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(`${formatDateWithOffset()} | ERROR | ` + "❌ Database Query Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length == 0) {
      return res.json({ message: "❌ Invalid username or password", user: null });
    }

    let now = new Date();
    console.log(`${formatDateWithOffset()} | DEBUG | ` + now.toISOString() + " ✅ Login successful / " + result[0].username);
    // Generate JWT
  const token = jwt.sign(
    { username: username, password: password },
    SECRET_KEY,
    { expiresIn: "30m" }); // token valid for 1 hour

    return res.json({
      message: "✅ Login successful",
      user: result[0],
      token,
    });
  });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // attach user info to request
    next();
  });
}

// app.post("/record_newTransaction", (req, res) => {
//   let sql =
//     `START TRANSACTION;

// INSERT INTO transactions (
//   transaction_id, transaction_type, channel,
//   payment_method, status, direction, value_date
// )
// VALUES (
//   '${req.body.txID}','${req.body.type}','MOBILE',
//   'QR','${req.bosy.status}','D', CURDATE()
// );

// SET @txn_id = LAST_INSERT_ID();

// INSERT INTO transaction_parties
// (transaction_id, party_role, account_number, party_name)
// VALUES
// (@txn_id,'INITIATOR','100001','${process.env.BIC}'),
// (@txn_id,'DEBTOR','${req.body.debitorAccount}','${req.body.debitorName}'),
// (@txn_id,'CREDITOR','${req.body.creditorAccount}','${req.body.creditorName}');

// INSERT INTO transaction_amounts
// (transaction_id, amount, fee, tax, total_amount, currency)
// VALUES
// (@txn_id, ${req.body.amount}, 0.00, 0.00, ${req.body.amount}, '${req.body.currency}');

// INSERT INTO ledger_entries
// (transaction_id, account_number, entry_type, amount, currency)
// VALUES
// (@txn_id,'${req.body.debitorAccount}','DEBIT',${req.body.amount},'${req.body.currency}'),
// (@txn_id,'${req.body.creditorAccount}','CREDIT',${req.body.amount},'${req.body.currency}');

// COMMIT;`;


//   db.query(sql, values, (err, result) => {
//     if (err)
//       return res.json({ message: "❌ Unable to register Transaction Record : " + err });
//     return res.json({ success: "✅ Transaction recorded added successfully." });
//   });
// });


app.post("/recordTransaction", (req, res) => {

  const {
    txID,
    type,
    status,
    debitorBank,
    debitorAccount,
    debitorName,
    creditorBank,
    creditorAccount,
    creditorName,
    amount,
    currency
  } = req.body;

  con.beginTransaction((err) => {
    if (err) {
      return res.json({ message: "❌ Failed to start recording the transaction: " + err });
    }

    const sql1 = `
      INSERT INTO transactions 
      (transaction_id, transaction_type, channel, payment_method, status, direction, value_date)
      VALUES (?, ?, 'MOBILE', 'QR', ?, 'D', CURDATE())
    `;

    con.query(sql1, [txID, type, status], (err, result1) => {
      if (err) {
        return con.rollback(() => {
          res.json({ message: "❌ Error inserting into transactions: " + err });
        });
      }

      const txn_id = result1.insertId;

      const sql2 = `
        INSERT INTO transaction_parties
        (transaction_id, party_role, account_number, party_name, bank_code)
        VALUES 
        (?, 'INITIATOR', '100001', ?, ?),
        (?, 'DEBTOR', ?, ?, ?),
        (?, 'CREDITOR', ?, ?, ?)
      `;

      con.query(
        sql2,
        [
          txn_id, process.env.BIC, process.env.BIC,
          txn_id, debitorAccount, debitorName, debitorBank,
          txn_id, creditorAccount, creditorName, creditorBank
        ],
        (err) => {
          if (err) {
            return con.rollback(() => {
              res.json({ message: "❌ Error inserting parties: " + err });
            });
          }

          const sql3 = `
            INSERT INTO transaction_amounts
            (transaction_id, amount, fee, tax, total_amount, currency)
            VALUES (?, ?, 0.00, 0.00, ?, ?)
          `;

          con.query(sql3, [txn_id, amount, amount, currency], (err) => {
            if (err) {
              return con.rollback(() => {
                res.json({ message: "❌ Error inserting amounts: " + err });
              });
            }

            const sql4 = `
              INSERT INTO ledger_entries
              (transaction_id, account_number, entry_type, amount, currency)
              VALUES
              (?, ?, 'DEBIT', ?, ?),
              (?, ?, 'CREDIT', ?, ?)
            `;

            con.query(
              sql4,
              [
                txn_id, debitorAccount, amount, currency,
                txn_id, creditorAccount, amount, currency
              ],
              (err) => {
                if (err) {
                  return con.rollback(() => {
                    res.json({ message: "❌ Error inserting ledger: " + err });
                  });
                }

                con.commit((err) => {
                  if (err) {
                    return con.rollback(() => {
                      res.json({ message: "❌ Commit failed: " + err });
                    });
                  }

                  res.json({ success: "✅ Transaction recorded successfully. -> "  + txID});
                });
              }
            );
          });
        }
      );
    });
  });
});


// --  Request Token from IPS  --
app.post("/requestToken", async (req, res) => {
  try {
    // let { grant_type, username, password } = req.body;

    let grant_type =req.body.grant_type;
    let username = req.body.username;
    let password = req.body.password;
    let jwt = req.body.jwt;

    let body = new URLSearchParams({
      grant_type,
      username,
      password,
    }).toString();
    console.log(`${formatDateWithOffset()} | DEBUG | ` + '')
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "IPS_ACCESS_TOKEN_URL : ", process.env.IPS_ACCESS_TOKEN_URL);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "JWT : ", jwt);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "username : ", username);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "password : ", password);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + '')

    let response = await axios.post(
      process.env.IPS_ACCESS_TOKEN_URL,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
            "jwt-assertion": jwt
        },
        timeout: 180000,
      }
    );
    if (response,data == null || response.data == "")
      res.status(response.status).json({Error : "Username or Password Error. Confirm your credentials!"});
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "Result : " + JSON.stringify(response.data, null, 2));
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      error: "❌ JWT Error / Please check and confirm your JWT",
      details: err.response?.data || err.message,
    });
  }
});


// --  Request Token from IPS  --
app.post("/jwt", async (req, res) => {
  try {
    
    const now = Math.floor(Date.now() / 1000);
    const jti = process.env.BIC + Date.now().toString();

    const payload = {
      iss: req.body.BIC,
      cert_iss: req.body.CERT_ISS,
      cert_sn: req.body.CERT_SN,
      iat: now,
      exp: now + 300, // 5 minutes
      jti: jti
    };

    const JWT = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: "RS256"
    });

    res.status(200).json(JWT);
  } catch (err) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + "JWT Generation ERROR:", err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      error: "❌ Token request failed",
      details: err.response?.data || err.message,
    });
  }
});


// --  Request Token from IPS  --
app.post("/token", async (req, res) => {
  try {
    // let { grant_type, username, password } = req.body;

    let grant_type = process.env.GRANT_TYPE || "password";
    let username = process.env.IPS_USERNAME || "yitbe";
    let password = process.env.IPS_PASSWORD || "yitbe1";

    const now = Math.floor(Date.now() / 1000000);
    const jti = process.env.BIC + Date.now().toString();

    const payload = {
      iss: process.env.BIC,
      cert_iss: process.env.CERT_ISS,
      cert_sn: process.env.CERT_SN,
      iat: now,
      exp: now + 300, // 5 minutes
      jti: jti
    };

    const JWT = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: "RS256"
    });

    let body = new URLSearchParams({
      grant_type,
      username,
      password,
    }).toString();

    console.log(`${formatDateWithOffset()} | DEBUG | ` + '')
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "IPS_ACCESS_TOKEN_URL : ", process.env.IPS_ACCESS_TOKEN_URL);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "JWT : ", JWT);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "username : ", username);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "password : ", password);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + '')

    let response = await axios.post(
      process.env.IPS_ACCESS_TOKEN_URL,
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "jwt-assertion": JWT
        },
        timeout: 180000,
      }
    );

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

    res.status(err.response?.status || 500).json({
      error: "❌ Token request failed",
      details: err.response?.data || err.message,
    });
  }
});



// -- Send acmt023 request to API Signer  --
// -- Send acmt023 request to API Signer  --
// -- Send acmt023 request to API Signer  --
app.post("/digest/acmt023", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let creditorBank = req.body.creditorBank;
    let creditorAccount = req.body.creditorAccount;

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03"
            xmlns:document="urn:iso:std:iso:20022:tech:xsd:acmt.023.001.03"
            xmlns="urn:iso:std:iso:20022:tech:xsd:verification_request">
  <header:AppHdr>
    <header:Fr>
      <header:FIId>
        <header:FinInstnId>
          <header:Othr>
            <header:Id>${bic}</header:Id>
          </header:Othr>
        </header:FinInstnId>
      </header:FIId>
    </header:Fr>
    <header:To>
      <header:FIId>
        <header:FinInstnId>
          <header:Othr>
            <header:Id>FP</header:Id>
          </header:Othr>
        </header:FinInstnId>
      </header:FIId>
    </header:To>
    <header:BizMsgIdr>${bic}${timestamp}</header:BizMsgIdr>
    <header:MsgDefIdr>acmt.023.001.03</header:MsgDefIdr>
    <header:CreDt>${now.toISOString()}</header:CreDt>
  </header:AppHdr>
  <document:Document>
    <document:IdVrfctnReq>
      <document:Assgnmt>
        <document:MsgId>${bic}${timestamp}</document:MsgId>
        <document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
        <document:Assgnr>
          <document:Agt>
            <document:FinInstnId>
              <document:Othr>
                <document:Id>${bic}</document:Id>
              </document:Othr>
            </document:FinInstnId>
          </document:Agt>
        </document:Assgnr>
        <document:Assgne>
          <document:Agt>
            <document:FinInstnId>
              <document:Othr>
                <document:Id>${creditorBank}</document:Id>
              </document:Othr>
            </document:FinInstnId>
          </document:Agt>
        </document:Assgne>
      </document:Assgnmt>
      <document:Vrfctn>
        <document:Id>${bic}${timestamp}${random}</document:Id>
        <document:PtyAndAcctId>
          <document:Acct>
            <document:Id>
              <document:Othr>
                <document:Id>${creditorAccount}</document:Id>
                <document:SchmeNm>
                  <document:Prtry>ACCT</document:Prtry>
                </document:SchmeNm>
              </document:Othr>
            </document:Id>
          </document:Acct>
        </document:PtyAndAcctId>
      </document:Vrfctn>
    </document:IdVrfctnReq>
  </document:Document>
</FPEnvelope>`;

    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign Verification API",
      details: error.message,
    });
  } 
});



// -- Send pacs008 request to API Signer  --
// -- Send pacs008 request to API Signer  --
// -- Send pacs008 request to API Signer  --
app.post("/digest/pacs008", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let amount = req.body.amount;
    let creditorBank = req.body.creditorBank;
    let creditorName = req.body.creditorName;
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = bic;
    let debitorAccount = req.body.debitorAccount;
    let debitorName = "";

    let random = Math.floor(10000 + Math.random() * 90000);

    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: debitorAccount,
          }
        );
        //extract the result
        debitorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + debitorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    let xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10" xmlns="urn:iso:std:iso:20022:tech:xsd:payment_request">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${debitorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.008.001.10</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
	<document:Document>
		<document:FIToFICstmrCdtTrf>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:NbOfTxs>1</document:NbOfTxs>
				<document:SttlmInf>
					<document:SttlmMtd>CLRG</document:SttlmMtd>
					<document:ClrSys>
						<document:Prtry>FP</document:Prtry>
					</document:ClrSys>
				</document:SttlmInf>
				<document:PmtTpInf>
					<document:LclInstrm>
						<document:Prtry>CRTRM</document:Prtry>
					</document:LclInstrm>
				</document:PmtTpInf>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${creditorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
			<document:CdtTrfTxInf>
				<document:PmtId>
					<document:EndToEndId>${bic}${timestamp}${random}</document:EndToEndId>
					<document:TxId>${bic}${timestamp}${random}</document:TxId>
				</document:PmtId>
				<document:IntrBkSttlmAmt Ccy="ETB">${amount}</document:IntrBkSttlmAmt>
				<document:AccptncDtTm>${formatDateWithOffset()}</document:AccptncDtTm>
				<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
				<document:ChrgBr>SLEV</document:ChrgBr>
				<document:Dbtr>
					<document:Nm>${debitorName}</document:Nm>
					<document:PstlAdr>
						<document:AdrLine>Address</document:AdrLine>
					</document:PstlAdr>
				</document:Dbtr>
				<document:DbtrAcct>
					<document:Id>
						<document:Othr>
							<document:Id>${debitorAccount}</document:Id>
							<document:SchmeNm>
								<document:Prtry>ACCT</document:Prtry>
							</document:SchmeNm>
							<document:Issr>C</document:Issr>
						</document:Othr>
					</document:Id>
				</document:DbtrAcct>
				<document:DbtrAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
							<document:Issr>ATM</document:Issr>
						</document:Othr>
					</document:FinInstnId>
				</document:DbtrAgt>
				<document:CdtrAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${creditorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:CdtrAgt>
				<document:Cdtr>
					<document:Nm>${creditorName}</document:Nm>
				</document:Cdtr>
				<document:CdtrAcct>
					<document:Id>
						<document:Othr>
							<document:Id>${creditorAccount}</document:Id>
							<document:SchmeNm>
								<document:Prtry>ACCT</document:Prtry>
							</document:SchmeNm>
						</document:Othr>
					</document:Id>
				</document:CdtrAcct>
				<document:RmtInf>
					<document:Ustrd>Transferring my funds</document:Ustrd>
				</document:RmtInf>
			</document:CdtTrfTxInf>
		</document:FIToFICstmrCdtTrf>
	</document:Document>
</FPEnvelope>`;

    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed sign pacs008 API ",
      details: error.message,
    });
  }
});



// -- Send normalpain013 request to API Signer  --
// -- Send normalpain013 request to API Signer  --
// -- Send normalpain013 request to API Signer  --
app.post("/digest/normalpain013", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let UETR = uuidv4();
    let EndToEndId = uuidv4().slice(0, 35);
    let amount = req.body.amount;
    let creditorBank = req.body.creditorBank;
    let merchantName = "";
    // let creditorName = req.body.creditorName;  
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = req.body.debitorBank;
    let debitorName = req.body.debitorName;
    let debitorAccount = req.body.debitorAccount;
    let random = Math.floor(10000 + Math.random() * 90000);
    OrgnlPmtInfId = bic+timestamp+random;
    OrgnlInstrId = bic+timestamp+random; 

    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        merchantName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + merchantName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }
    
    // let debtorName = creditorName;
    
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n creditorName: " + merchantName);

    if (debitorName = "" || debitorName == null) {
      debitorName = "Debitor Name"
    }
    let pain013Body = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:request_to_pay" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pain.013.001.10" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pain.013.001.10</header:MsgDefIdr>
		<header:CreDt>${formatDateWithZRTP()}</header:CreDt>
	</header:AppHdr>
	<document:Document>
		<document:CdtrPmtActvtnReq>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${now.toISOString()}</document:CreDtTm>
				<document:NbOfTxs>1</document:NbOfTxs>
				<document:InitgPty>
					<document:Id>
						<document:OrgId>
							<document:Othr>
								<document:Id>${bic}</document:Id>
							</document:Othr>
						</document:OrgId>
					</document:Id>
				</document:InitgPty>
			</document:GrpHdr>
			<document:PmtInf>
				<document:PmtInfId>${OrgnlPmtInfId}</document:PmtInfId>
				<document:PmtMtd>TRF</document:PmtMtd>
				<document:ReqdExctnDt>
	                    <document:DtTm>${now.toISOString()}</document:DtTm>
	                </document:ReqdExctnDt>
				<document:XpryDt>
					<document:DtTm>${expired.toISOString()}</document:DtTm>
				</document:XpryDt>
				<document:Dbtr>
                    <document:Nm>${debitorName}</document:Nm>
                    <document:PstlAdr>
                        <document:AdrLine>Debtor ADDRESS</document:AdrLine>
                    </document:PstlAdr>
                </document:Dbtr>
                <document:DbtrAcct>
                    <document:Id>
                        <document:Othr>
                            <document:Id>${debitorAccount}</document:Id>
                        </document:Othr>
                    </document:Id>
                </document:DbtrAcct>
                <document:DbtrAgt>
                    <document:FinInstnId>
                        <document:Othr>
                            <document:Id>${debitorBank}</document:Id>
                        </document:Othr>
                    </document:FinInstnId>
                </document:DbtrAgt>
				<document:CdtTrfTx>
					<document:PmtId>
						<document:InstrId>${OrgnlInstrId}</document:InstrId>
						<document:EndToEndId>${EndToEndId}</document:EndToEndId>
						<document:UETR>${UETR}</document:UETR>
					</document:PmtId>
					<document:PmtTpInf>
						<document:LclInstrm>
							<document:Prtry>CRTAM</document:Prtry>
						</document:LclInstrm>
						<document:CtgyPurp>
							<document:Prtry>C2CRTP</document:Prtry>
						</document:CtgyPurp>
					</document:PmtTpInf>
					<document:PmtCond>
						<document:AmtModAllwd>false</document:AmtModAllwd>
						<document:EarlyPmtAllwd>true</document:EarlyPmtAllwd>
						<document:GrntedPmtReqd>false</document:GrntedPmtReqd>
					</document:PmtCond>
					<document:Amt>
						<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
					</document:Amt>
					<document:ChrgBr>SLEV</document:ChrgBr>
					<document:CdtrAgt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${creditorBank}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:CdtrAgt>
					<document:Cdtr>
						<document:Nm>${merchantName}</document:Nm>
						<document:PstlAdr>
							<document:AdrLine>Merchant Address</document:AdrLine>
						</document:PstlAdr>
					</document:Cdtr>
					<document:CdtrAcct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
							</document:Othr>
						</document:Id>
					</document:CdtrAcct>
					<document:Purp>
                        		<document:Prtry>PURP</document:Prtry>
                    	</document:Purp>
					<document:RmtInf>
						<document:Ustrd>SOME CONTEXT</document:Ustrd>
						<document:Strd>
							<document:RfrdDocInf>
								<document:Tp>
									<document:CdOrPrtry>
										<document:Prtry>BILL</document:Prtry>
									</document:CdOrPrtry>
								</document:Tp>
							</document:RfrdDocInf>
						</document:Strd>
					</document:RmtInf>
				</document:CdtTrfTx>
			</document:PmtInf>
		</document:CdtrPmtActvtnReq>
	</document:Document>
</FPEnvelope>`;
    RTPExpiredTime = expired.toISOString();
    let signedpain013response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      pain013Body,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(signedpain013response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + signedpain013response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign Normal RTP Request",
      details: error.message,
    });
  }
});



// -- Send blankpain013 request to API Signer  --
// -- Send blankpain013 request to API Signer  --
// -- Send blankpain013 request to API Signer  --
app.post("/digest/blankpain013", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let UETR = uuidv4();
    let EndToEndId = uuidv4().slice(0, 35);
    let amount = req.body.amount;
    let creditorBank = req.body.creditorBank;
    let creditorAccount = req.body.creditorAccount;
    let random = Math.floor(10000 + Math.random() * 90000);
    OrgnlPmtInfId = bic+timestamp+random;
    OrgnlInstrId = bic+timestamp+random; 
    OrgnlMsgId = bic+timestamp+random; 

    let blankRTPRequestBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope
    xmlns="urn:iso:std:iso:20022:tech:xsd:request_to_pay"
    xmlns:document="urn:iso:std:iso:20022:tech:xsd:pain.013.001.10"
    xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
    <header:AppHdr>
        <header:Fr>
            <header:FIId>
                <header:FinInstnId>
                    <header:Othr>
                        <header:Id>${bic}</header:Id>
                    </header:Othr>
                </header:FinInstnId>
            </header:FIId>
        </header:Fr>
        <header:To>
            <header:FIId>
                <header:FinInstnId>
                    <header:Othr>
                        <header:Id>FP</header:Id>
                    </header:Othr>
                </header:FinInstnId>
            </header:FIId>
        </header:To>
        <header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
        <header:MsgDefIdr>pain.013.001.10</header:MsgDefIdr>
        <header:CreDt>${formatDateWithOffset()}</header:CreDt>
    </header:AppHdr>
    <document:Document>
        <document:CdtrPmtActvtnReq>
            <document:GrpHdr>
                <document:MsgId>${OrgnlMsgId}</document:MsgId>
                <document:CreDtTm>${now.toISOString()}</document:CreDtTm>
                <document:NbOfTxs>1</document:NbOfTxs>
                <document:InitgPty>
                    <document:Id>
                        <document:OrgId>
                            <document:Othr>
                                <document:Id>${bic}</document:Id>
                            </document:Othr>
                        </document:OrgId>
                    </document:Id>
                </document:InitgPty>
            </document:GrpHdr>
            <document:PmtInf>
                <document:PmtInfId>${OrgnlPmtInfId}</document:PmtInfId>
                <document:PmtMtd>TRF</document:PmtMtd>
                <document:ReqdExctnDt>
                    <document:DtTm>${now.toISOString()}</document:DtTm>
                </document:ReqdExctnDt>
                <document:XpryDt>
                    <document:DtTm>${expired.toISOString()}</document:DtTm>
                </document:XpryDt>
                <document:Dbtr></document:Dbtr>
                <document:DbtrAcct></document:DbtrAcct>
                <document:DbtrAgt>
                    <document:FinInstnId></document:FinInstnId>
                </document:DbtrAgt>
                <document:CdtTrfTx>
                    <document:PmtId>
                        <document:InstrId>${OrgnlInstrId}</document:InstrId>
                        <document:EndToEndId>${EndToEndId}</document:EndToEndId>
                        <document:UETR>${UETR}</document:UETR>
                    </document:PmtId>
                    <document:PmtTpInf>
                        <document:LclInstrm>
                            <document:Prtry>CRTAM</document:Prtry>
                        </document:LclInstrm>
                        <document:CtgyPurp>
                            <document:Prtry>C2CRTP</document:Prtry>
                        </document:CtgyPurp>
                    </document:PmtTpInf>
                    <document:PmtCond>
                        <document:AmtModAllwd>false</document:AmtModAllwd>
                        <document:EarlyPmtAllwd>true</document:EarlyPmtAllwd>
                        <document:GrntedPmtReqd>false</document:GrntedPmtReqd>
                    </document:PmtCond>
                    <document:Amt>
                        <document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
                    </document:Amt>
                    <document:ChrgBr>SLEV</document:ChrgBr>
                    <document:CdtrAgt>
                        <document:FinInstnId>
                            <document:Othr>
                                <document:Id>${creditorBank}</document:Id>
                            </document:Othr>
                        </document:FinInstnId>
                    </document:CdtrAgt>
                    <document:Cdtr>
                        <document:Nm>MERCHANT NAME</document:Nm>
                        <document:PstlAdr>
                            <document:AdrLine>Merchant Address</document:AdrLine>
                        </document:PstlAdr>
                    </document:Cdtr>
                    <document:CdtrAcct>
                        <document:Id>
                            <document:Othr>
                                <document:Id>${creditorAccount}</document:Id>
                            </document:Othr>
                        </document:Id>
                    </document:CdtrAcct>
                    <document:Purp>
                        <document:Prtry>PURP</document:Prtry>
                    </document:Purp>
                    <document:RmtInf>
                        <document:Ustrd>SOME CONTEXT</document:Ustrd>
                        <document:Strd>
                            <document:RfrdDocInf>
                                <document:Tp>
                                    <document:CdOrPrtry>
                                        <document:Prtry>BILL</document:Prtry>
                                    </document:CdOrPrtry>
                                </document:Tp>
                            </document:RfrdDocInf>
                        </document:Strd>
                    </document:RmtInf>
                </document:CdtTrfTx>
            </document:PmtInf>
        </document:CdtrPmtActvtnReq>
    </document:Document>
</FPEnvelope>`;


    RTPExpiredTime = expired.toISOString();

    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      blankRTPRequestBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to call blank RTP Signer API ",
      details: error.message,
    });
  }
});


// -- Send camt055 request to API Signer  --
// -- Send camt055 request to API Signer  --
// -- Send camt055 request to API Signer  --
app.post("/digest/camt055", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let random = Math.floor(10000 + Math.random() * 90000);
    let OrgnlUETR = req.body.OrgnlUETR;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlPmtInfId = req.body.OrgnlPmtInfId;
    let debitorBank = req.body.debitorBank;
    let Reason = req.body.Reason;
    let AddtlInf = req.body.AddtlInf;

    if (debitorBank == null) {
      debitorBank = "YITBETAA";
    }
    let camt055Body = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:cancellationRTP_request" xmlns:document="urn:iso:std:iso:20022:tech:xsd:camt.055.001.10" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>camt.055.001.10</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
	<document:Document>
		<document:CstmrPmtCxlReq>
			<document:Assgnmt>
				<document:Id>${bic}${timestamp}${random}</document:Id>
				<document:Assgnr>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${bic}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgnr>
				<document:Assgne>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${debitorBank}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgne>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
			</document:Assgnmt>
			<document:Case>
				<document:Id>${bic}${timestamp}${random}</document:Id>
				<document:Cretr>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${bic}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Cretr>
			</document:Case>
			<document:Undrlyg>
				<document:OrgnlPmtInfAndCxl>
					<document:OrgnlPmtInfId>${OrgnlPmtInfId}</document:OrgnlPmtInfId>
					<document:OrgnlGrpInf>
						<document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
						<document:OrgnlMsgNmId>pain.013.001.10</document:OrgnlMsgNmId>
					</document:OrgnlGrpInf>
					<document:CxlRsnInf>
						<document:Rsn>
							<document:Prtry>${Reason}</document:Prtry>
						</document:Rsn>
						<document:AddtlInf>${AddtlInf}</document:AddtlInf>
					</document:CxlRsnInf>
					<document:TxInf>
						<document:OrgnlUETR>${OrgnlUETR}</document:OrgnlUETR>
					</document:TxInf>
				</document:OrgnlPmtInfAndCxl>
			</document:Undrlyg>
		</document:CstmrPmtCxlReq>
	</document:Document>
</FPEnvelope>`;

    let signedpain013response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      camt055Body,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(signedpain013response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + signedpain013response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign Cancel RTP Request",
      details: error.message,
    });
  }
});


// -- Send pacs028 RTP request to API Signer  --
// -- Send pacs028 RTP request to API Signer  --
// -- Send pacs028 RTP request to API Signer  --
app.post("/digest/pacs028/queryRTPInfo", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let random = Math.floor(10000 + Math.random() * 90000);
    let OrgnlUETR = req.body.OrgnlUETR;

    let pacs028Body = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.028.001.05" xmlns="urn:iso:std:iso:20022:tech:xsd:paymentStatus_request">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.028.001.05</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsReq>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
			</document:GrpHdr>
			<document:TxInf>
				<document:OrgnlUETR>${OrgnlUETR}</document:OrgnlUETR>
			</document:TxInf>
		</document:FIToFIPmtStsReq>
	</document:Document>
</FPEnvelope>`;

    let signedpacs028response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      pacs028Body,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(signedpacs028response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + signedpacs028response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign RTP Status Request",
      details: error.message,
    });
  }
});


// -- Send pacs028 P2P request to API Signer  --
// -- Send pacs028 P2P request to API Signer  --
// -- Send pacs028 P2P request to API Signer  --
app.post("/digest/pacs028/queryP2PInfo", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let random = Math.floor(10000 + Math.random() * 90000);
    let TxId = req.body.TxId;

    let pacs028Body = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.028.001.05" xmlns="urn:iso:std:iso:20022:tech:xsd:paymentStatus_request">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.028.001.05</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsReq>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
			</document:GrpHdr>
			<document:TxInf>
				<document:OrgnlTxId>${TxId}</document:OrgnlTxId>
			</document:TxInf>
		</document:FIToFIPmtStsReq>
	</document:Document>
</FPEnvelope>`;

    let signedpacs028response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      pacs028Body,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(signedpacs028response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + signedpacs028response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign QueryStatus Request",
      details: error.message,
    });
  }
});


// -- Send pacs004 returnPayment request to API Signer  --
// -- Send pacs004 returnPayment request to API Signer  --
// -- Send pacs004 returnPayment request to API Signer  --
app.post("/digest/pacs004", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");

    let random = Math.floor(10000 + Math.random() * 90000);
    let TxId = req.body.TxId;

    let pacs004Body = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<FPEnvelope xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.11" xmlns="urn:iso:std:iso:20022:tech:xsd:returnPayment_request">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.004.001.11</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
		<document:Document>
		<document:PmtRtr>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:NbOfTxs>1</document:NbOfTxs>
				<document:SttlmInf>
					<document:SttlmMtd>CLRG</document:SttlmMtd>
					<document:ClrSys>
						<document:Prtry>FP</document:Prtry>
					</document:ClrSys>
				</document:SttlmInf>
				<document:PmtTpInf>
					<document:LclInstrm>
						<document:Prtry>С2С</document:Prtry>
					</document:LclInstrm>
				</document:PmtTpInf>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${bic}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${req.body.OrgnlDebitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
			<document:TxInf>
				<document:RtrId>${bic}${timestamp}${random}</document:RtrId>
				<document:OrgnlEndToEndId>${req.body.OrgnlEndToEndId}</document:OrgnlEndToEndId>
				<document:OrgnlTxId>${req.body.OrgnlTxId}</document:OrgnlTxId>
				<document:RtrdIntrBkSttlmAmt Ccy="ETB">${req.body.amount}</document:RtrdIntrBkSttlmAmt>
				<document:RtrRsnInf>
					<document:Rsn>
						<document:Prtry>CHCK</document:Prtry>
					</document:Rsn>
					<document:AddtlInf>Maximum account balance exceeded</document:AddtlInf>
				</document:RtrRsnInf>
			</document:TxInf>
		</document:PmtRtr>
	</document:Document>
</FPEnvelope>`;


    let signedpacs004response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      pacs004Body,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    res.status(200).send(signedpacs004response.data);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + signedpacs004response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign QueryStatus Request",
      details: error.message,
    });
  }
});



// -- Send acmt024 correct scenario request to API Signer  --
// -- Send acmt024 correct scenario request to API Signer  --
// -- Send acmt024 correct scenario request to API Signer  --
app.post("/digest/acmt024/success", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlId = req.body.OrgnlId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = req.body.debitorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    let creditorName = req.body.creditorName;

    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        creditorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + creditorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:verification_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:acmt.024.001.03" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>acmt.024.001.03</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
  <header:Rltd>
            <header:Fr>
                <header:FIId>
                    <header:FinInstnId>
                        <header:Othr>
                            <header:Id>${debitorBank}</header:Id>
                        </header:Othr>
                    </header:FinInstnId>
                </header:FIId>
            </header:Fr>
            <header:To>
                <header:FIId>
                    <header:FinInstnId>
                        <header:Othr>
                            <header:Id>FP</header:Id>
                        </header:Othr>
                    </header:FinInstnId>
                </header:FIId>
            </header:To>
            <header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
            <header:MsgDefIdr>acmt.023.001.03</header:MsgDefIdr>
            <header:CreDt>${OrgnlCreDt}</header:CreDt>
        </header:Rltd>
	<document:Document>
		<document:IdVrfctnRpt>
			<document:Assgnmt>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:Assgnr>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${bic}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgnr>
				<document:Assgne>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${debitorBank}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgne>
			</document:Assgnmt>
			<document:OrgnlAssgnmt>
				<document:MsgId>${OrgnlMsgId}</document:MsgId>
				<document:CreDtTm>${OrgnlCreDtTm}</document:CreDtTm>
			</document:OrgnlAssgnmt>
			<document:Rpt>
				<document:OrgnlId>${OrgnlId}</document:OrgnlId>
				<document:Vrfctn>true</document:Vrfctn>
				<document:Rsn>
					<document:Prtry>SUCC</document:Prtry>
				</document:Rsn>
				<document:OrgnlPtyAndAcctId>
					<document:Acct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>ACCT</document:Prtry>
								</document:SchmeNm>
							</document:Othr>
						</document:Id>
					</document:Acct>
				</document:OrgnlPtyAndAcctId>
				<document:UpdtdPtyAndAcctId>
					<document:Pty>
						<document:Nm>${creditorName}</document:Nm>
					</document:Pty>
					<document:Acct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>ACCT</document:Prtry>
								</document:SchmeNm>
							</document:Othr>
						</document:Id>
					</document:Acct>
				</document:UpdtdPtyAndAcctId>
			</document:Rpt>
		</document:IdVrfctnRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody);

    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "Failed to Sign acmt024 API ",
      details: error.message,
    });
  }
});

// -- Send acmt024 incorrect scenario request to API Signer  --
// -- Send acmt024 incorrect scenario request to API Signer  --
// -- Send acmt024 incorrect scenario request to API Signer  --
app.post("/digest/acmt024/fail", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlId = req.body.OrgnlId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = req.body.debitorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:verification_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:acmt.024.001.03" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${bic}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>acmt.024.001.03</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
	</header:AppHdr>
  <header:Rltd>
            <header:Fr>
                <header:FIId>
                    <header:FinInstnId>
                        <header:Othr>
                            <header:Id>${debitorBank}</header:Id>
                        </header:Othr>
                    </header:FinInstnId>
                </header:FIId>
            </header:Fr>
            <header:To>
                <header:FIId>
                    <header:FinInstnId>
                        <header:Othr>
                            <header:Id>FP</header:Id>
                        </header:Othr>
                    </header:FinInstnId>
                </header:FIId>
            </header:To>
            <header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
            <header:MsgDefIdr>acmt.023.001.03</header:MsgDefIdr>
            <header:CreDt>${OrgnlCreDt}</header:CreDt>
        </header:Rltd>
	<document:Document>
		<document:IdVrfctnRpt>
			<document:Assgnmt>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:Assgnr>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${bic}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgnr>
				<document:Assgne>
					<document:Agt>
						<document:FinInstnId>
							<document:Othr>
								<document:Id>${debitorBank}</document:Id>
							</document:Othr>
						</document:FinInstnId>
					</document:Agt>
				</document:Assgne>
			</document:Assgnmt>
			<document:OrgnlAssgnmt>
				<document:MsgId>${OrgnlMsgId}</document:MsgId>
				<document:CreDtTm>${OrgnlCreDtTm}</document:CreDtTm>
			</document:OrgnlAssgnmt>
			<document:Rpt>
				<document:OrgnlId>${OrgnlId}</document:OrgnlId>
				<document:Vrfctn>false</document:Vrfctn>
				<document:Rsn>
					<document:Prtry>${errorcode}</document:Prtry>
				</document:Rsn>
				<document:OrgnlPtyAndAcctId>
					<document:Acct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>ACCT</document:Prtry>
								</document:SchmeNm>
							</document:Othr>
						</document:Id>
					</document:Acct>
				</document:OrgnlPtyAndAcctId>
			</document:Rpt>
		</document:IdVrfctnRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody);

    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign acmt024 API ",
      details: error.message,
    });
  }
});


// -- Send pacs002 correct scenario request to API Signer  --
// -- Send pacs002 correct scenario request to API Signer  --
// -- Send pacs002 correct scenario request to API Signer  --
app.post("/digest/pacs002/success", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlTxId = req.body.OrgnlTxId;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = req.body.debitorBank;
    let debitorName = req.body.debitorName;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    let OrgnlDebitorAdd = req.body.OrgnlDebitorAdd;
    let amount = req.body.amount;
    let debitorAccount = req.body.debitorAccount;
    let debitorAccType = req.body.debitorAccType;


    let creditorName = req.body.creditorName;
    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        creditorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + creditorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:payment_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${debitorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${debitorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${bic}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
      <document:OrgnlGrpInf>
        <document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
        <document:OrgnlMsgNmId>pacs.002.001.12</document:OrgnlMsgNmId>
        <document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
      </document:OrgnlGrpInf>
			<document:TxInfAndSts>
				<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
				<document:OrgnlTxId>${OrgnlTxId}</document:OrgnlTxId>
				<document:TxSts>ACSC</document:TxSts>
				<document:AccptncDtTm>${formatDateWithOffset()}</document:AccptncDtTm>
				<document:OrgnlTxRef>
					<document:IntrBkSttlmAmt Ccy="ETB">${amount}</document:IntrBkSttlmAmt>
					<document:Amt>
						<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
					</document:Amt>
					<document:PmtTpInf>
						<document:CtgyPurp>
							<document:Prtry>C2CCRT</document:Prtry>
						</document:CtgyPurp>
					</document:PmtTpInf>
					<document:RmtInf>
						<document:Ustrd>Transferring my funds</document:Ustrd>
					</document:RmtInf>
					<document:Dbtr>
						<document:Pty>
							<document:Nm>${debitorName}</document:Nm>
							<document:PstlAdr>
								<document:AdrLine>${OrgnlDebitorAdd}</document:AdrLine>
							</document:PstlAdr>
						</document:Pty>
					</document:Dbtr>
					<document:DbtrAcct>
						<document:Id>
							<document:Othr>
								<document:Id>${debitorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>${debitorAccType}</document:Prtry>
								</document:SchmeNm>
								<document:Issr>C</document:Issr>
							</document:Othr>
						</document:Id>
					</document:DbtrAcct>
					<document:Cdtr>
						<document:Pty>
							<document:Nm>${creditorName}</document:Nm>
						</document:Pty>
					</document:Cdtr>
					<document:CdtrAcct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>ACCT</document:Prtry>
								</document:SchmeNm>
							</document:Othr>
						</document:Id>
					</document:CdtrAcct>
				</document:OrgnlTxRef>
			</document:TxInfAndSts>
		</document:FIToFIPmtStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody);

    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pacs002 API ",
      details: error.message,
    });
  }
});


// -- Send pacs002 incorrect scenario request to API Signer  --
// -- Send pacs002 incorrect scenario request to API Signer  --
// -- Send pacs002 incorrect scenario request to API Signer  --
app.post("/digest/pacs002/fail", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlTxId = req.body.OrgnlTxId;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let creditorAccount = req.body.creditorAccount;
    let debitorBank = req.body.debitorBank;
    let debitorName = req.body.debitorName;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    let OrgnlDebitorAdd = req.body.OrgnlDebitorAdd;
    let amount = req.body.amount;
    let debitorAccount = req.body.debitorAccount;
    let debitorAccType = req.body.debitorAccType;
    
    let creditorName = req.body.creditorName;
    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        creditorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + creditorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:payment_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${debitorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${debitorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${bic}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
      <document:OrgnlGrpInf>
					<document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
					<document:OrgnlMsgNmId>pacs.002.001.12</document:OrgnlMsgNmId>
					<document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
				</document:OrgnlGrpInf>
			<document:TxInfAndSts>
				<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
				<document:OrgnlTxId>${OrgnlTxId}</document:OrgnlTxId>
				<document:TxSts>RJCT</document:TxSts>
        <document:StsRsnInf>
            <document:Rsn>
                <document:Prtry>ERRR</document:Prtry>
            </document:Rsn>
            <document:AddtlInf>${errorcode}</document:AddtlInf>
        </document:StsRsnInf>
				<document:AccptncDtTm>${formatDateWithOffset()}</document:AccptncDtTm>
				<document:OrgnlTxRef>
					<document:IntrBkSttlmAmt Ccy="ETB">${amount}</document:IntrBkSttlmAmt>
					<document:Amt>
						<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
					</document:Amt>
					<document:PmtTpInf>
						<document:CtgyPurp>
							<document:Prtry>C2CCRT</document:Prtry>
						</document:CtgyPurp>
					</document:PmtTpInf>
					<document:RmtInf>
						<document:Ustrd>Transferring my funds</document:Ustrd>
					</document:RmtInf>
					<document:Dbtr>
						<document:Pty>
							<document:Nm>${debitorName}</document:Nm>
							<document:PstlAdr>
								<document:AdrLine>${OrgnlDebitorAdd}</document:AdrLine>
							</document:PstlAdr>
						</document:Pty>
					</document:Dbtr>
					<document:DbtrAcct>
						<document:Id>
							<document:Othr>
								<document:Id>${debitorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>${debitorAccType}</document:Prtry>
								</document:SchmeNm>
								<document:Issr>C</document:Issr>
							</document:Othr>
						</document:Id>
					</document:DbtrAcct>
					<document:Cdtr>
						<document:Pty>
							<document:Nm>${creditorName}</document:Nm>
						</document:Pty>
					</document:Cdtr>
					<document:CdtrAcct>
						<document:Id>
							<document:Othr>
								<document:Id>${creditorAccount}</document:Id>
								<document:SchmeNm>
									<document:Prtry>ACCT</document:Prtry>
								</document:SchmeNm>
							</document:Othr>
						</document:Id>
					</document:CdtrAcct>
				</document:OrgnlTxRef>
			</document:TxInfAndSts>
		</document:FIToFIPmtStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody); 
    
    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pacs002 API ",   
      details: error.message,
    });
  }
});



// -- Send pacs002forReturn correct scenario request to API Signer  --
// -- Send pacs002forReturn correct scenario request to API Signer  --
// -- Send pacs002forReturn correct scenario request to API Signer  --
app.post("/digest/pacs002forReturn/success", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlTxId = req.body.OrgnlTxId;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let debitorBank = req.body.debitorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    let amount = req.body.amount;

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:payment_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${debitorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${debitorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${bic}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
      <document:OrgnlGrpInf>
        <document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
        <document:OrgnlMsgNmId>pacs.002.001.12</document:OrgnlMsgNmId>
        <document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
      </document:OrgnlGrpInf>
			<document:TxInfAndSts>
				<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
				<document:OrgnlTxId>${OrgnlTxId}</document:OrgnlTxId>
				<document:TxSts>ACSC</document:TxSts>
				<document:AccptncDtTm>${formatDateWithOffset()}</document:AccptncDtTm>
				<document:OrgnlTxRef>
					<document:IntrBkSttlmAmt Ccy="ETB">${amount}</document:IntrBkSttlmAmt>
					<document:Amt>
						<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
					</document:Amt>
					<document:PmtTpInf>
						<document:CtgyPurp>
							<document:Prtry>C2CCRT</document:Prtry>
						</document:CtgyPurp>
				</document:OrgnlTxRef>
			</document:TxInfAndSts>
		</document:FIToFIPmtStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody);

    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pacs002 API ",
      details: error.message,
    });
  }
});


// -- Send pacs002forReturn incorrect scenario request to API Signer  --
// -- Send pacs002forReturn incorrect scenario request to API Signer  --
// -- Send pacs002forReturn incorrect scenario request to API Signer  --
app.post("/digest/pacs002forReturn/fail", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlTxId = req.body.OrgnlTxId;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    let debitorBank = req.body.debitorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    let amount = req.body.amount;

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:payment_response" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${debitorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${debitorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pacs.002.001.12</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:FIToFIPmtStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InstgAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${bic}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstgAgt>
				<document:InstdAgt>
					<document:FinInstnId>
						<document:Othr>
							<document:Id>${debitorBank}</document:Id>
						</document:Othr>
					</document:FinInstnId>
				</document:InstdAgt>
			</document:GrpHdr>
      <document:OrgnlGrpInf>
        <document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
        <document:OrgnlMsgNmId>pacs.002.001.12</document:OrgnlMsgNmId>
        <document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
      </document:OrgnlGrpInf>
			<document:TxInfAndSts>
				<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
				<document:OrgnlTxId>${OrgnlTxId}</document:OrgnlTxId>
				<document:TxSts>RJCT</document:TxSts>
        <document:StsRsnInf>
            <document:Rsn>
                <document:Prtry>ERRR</document:Prtry>
            </document:Rsn>
            <document:AddtlInf>BLCK</document:AddtlInf>
        </document:StsRsnInf>
				<document:AccptncDtTm>${formatDateWithOffset()}</document:AccptncDtTm>
				<document:OrgnlTxRef>
					<document:IntrBkSttlmAmt Ccy="ETB">${amount}</document:IntrBkSttlmAmt>
					<document:Amt>
						<document:InstdAmt Ccy="ETB">${amount}</document:InstdAmt>
					</document:Amt>
					<document:PmtTpInf>
						<document:CtgyPurp>
							<document:Prtry>C2CCRT</document:Prtry>
						</document:CtgyPurp>
				</document:OrgnlTxRef>
			</document:TxInfAndSts>
		</document:FIToFIPmtStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    verificationResponseBody = response.data;
    verificationResponseBody = verificationResponseBody.replace("document:Sgntr", "Sgntr");

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signer Response : **********  " + verificationResponseBody);

    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pacs002 API ",
      details: error.message,
    });
  }
});



// -- Send pain014 correct scenario request to API Signer  --
// -- Send pain014 correct scenario request to API Signer  --
// -- Send pain014 correct scenario request to API Signer  --
app.post("/digest/pain014/success", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlUETR = req.body.OrgnlUETR;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    // let creditorAccount = req.body.creditorAccount;
    let creditorBank = req.body.creditorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    // let OrgnlCreditorAdd = req.body.OrgnlCreditorAdd;
    let InitgPty = req.body.InitgPty;
    let OrgnlPmtInfId = req.body.OrgnlPmtInfId;
    let OrgnlInstrId = req.body.OrgnlInstrId;

    // let amount = req.body.amount;
    // let debitorAccount = req.body.debitorAccount;
    // let debitorAccType = req.body.debitorAccType;
    
    
      // creditorBank: ,creditorBank

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:rtp_update" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pain.014.001.10" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${creditorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pain.014.001.10</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${creditorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pain.013.001.10</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:CdtrPmtActvtnReqStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InitgPty>
					<document:Id>
						<document:OrgId>
							<document:Othr>
								<document:Id>${InitgPty}</document:Id>
							</document:Othr>
						</document:OrgId>
					</document:Id>
				</document:InitgPty>
			</document:GrpHdr>
			<document:OrgnlGrpInfAndSts>
				<document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
				<document:OrgnlMsgNmId>pain.013.001.10</document:OrgnlMsgNmId>
				<document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
			</document:OrgnlGrpInfAndSts>
			<document:OrgnlPmtInfAndSts>
				<document:OrgnlPmtInfId>${OrgnlPmtInfId}</document:OrgnlPmtInfId>
				<document:TxInfAndSts>
					<document:OrgnlInstrId>${OrgnlInstrId}</document:OrgnlInstrId>
					<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
					<document:OrgnlUETR>${OrgnlUETR}</document:OrgnlUETR>
					<document:TxSts>RCVD</document:TxSts>
				</document:TxInfAndSts>
			</document:OrgnlPmtInfAndSts>
		</document:CdtrPmtActvtnReqStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    RequestToPayResponseBody = response.data;
    RequestToPayResponseBody = RequestToPayResponseBody.replace("document:Sgntr", "Sgntr");

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signed Pain014 : **********  " + RequestToPayResponseBody);
    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pain014 API ",
      details: error.message,
    });
  }
});



// -- Send pain014 incorrect scenario request to API Signer  --
// -- Send pain014 incorrect scenario request to API Signer  --
// -- Send pain014 incorrect scenario request to API Signer  --
app.post("/digest/pain014/fail", async (req, res) => {
  try {
    // Generate timestamps (replacing JMeter variables)
    let now = new Date();
    let expired = new Date();
    expired.setMinutes(expired.getMinutes() + 10);
    let timestamp = now
      .toISOString()
      .replace(/[-:.TZ]/g, "")
      .padEnd(20, "0");
    let OrgnlUETR = req.body.OrgnlUETR;
    let OrgnlEndToEndId = req.body.OrgnlEndToEndId;
    let OrgnlMsgId = req.body.OrgnlMsgId;
    let OrgnlCreDtTm = req.body.OrgnlCreDtTm;
    // let creditorAccount = req.body.creditorAccount;
    let creditorBank = req.body.creditorBank;
    let OrgnlBizMsgIdr = req.body.OrgnlBizMsgIdr;
    let OrgnlCreDt = req.body.OrgnlCreDt;
    // let OrgnlCreditorAdd = req.body.OrgnlCreditorAdd;
    let InitgPty = req.body.InitgPty;
    let OrgnlPmtInfId = req.body.OrgnlPmtInfId;
    let OrgnlInstrId = req.body.OrgnlInstrId;

    // let amount = req.body.amount;
    // let debitorAccount = req.body.debitorAccount;
    // let debitorAccType = req.body.debitorAccType;
    
    
      // creditorBank: ,creditorBank

    let random = Math.floor(10000 + Math.random() * 90000);

    let xmlBody = `<FPEnvelope xmlns="urn:iso:std:iso:20022:tech:xsd:rtp_update" xmlns:document="urn:iso:std:iso:20022:tech:xsd:pain.014.001.10" xmlns:header="urn:iso:std:iso:20022:tech:xsd:head.001.001.03">
	<header:AppHdr>
		<header:Fr>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>FP</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:Fr>
		<header:To>
			<header:FIId>
				<header:FinInstnId>
					<header:Othr>
						<header:Id>${creditorBank}</header:Id>
					</header:Othr>
				</header:FinInstnId>
			</header:FIId>
		</header:To>
		<header:BizMsgIdr>${bic}${timestamp}${random}</header:BizMsgIdr>
		<header:MsgDefIdr>pain.014.001.10</header:MsgDefIdr>
		<header:CreDt>${now.toISOString()}</header:CreDt>
		<header:Rltd>
			<header:Fr>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>${creditorBank}</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:Fr>
			<header:To>
				<header:FIId>
					<header:FinInstnId>
						<header:Othr>
							<header:Id>FP</header:Id>
						</header:Othr>
					</header:FinInstnId>
				</header:FIId>
			</header:To>
			<header:BizMsgIdr>${OrgnlBizMsgIdr}</header:BizMsgIdr>
			<header:MsgDefIdr>pain.013.001.10</header:MsgDefIdr>
			<header:CreDt>${OrgnlCreDt}</header:CreDt>
		</header:Rltd>
	</header:AppHdr>
	<document:Document>
		<document:CdtrPmtActvtnReqStsRpt>
			<document:GrpHdr>
				<document:MsgId>${bic}${timestamp}${random}</document:MsgId>
				<document:CreDtTm>${formatDateWithOffset()}</document:CreDtTm>
				<document:InitgPty>
					<document:Id>
						<document:OrgId>
							<document:Othr>
								<document:Id>${InitgPty}</document:Id>
							</document:Othr>
						</document:OrgId>
					</document:Id>
				</document:InitgPty>
			</document:GrpHdr>
			<document:OrgnlGrpInfAndSts>
				<document:OrgnlMsgId>${OrgnlMsgId}</document:OrgnlMsgId>
				<document:OrgnlMsgNmId>pain.013.001.10</document:OrgnlMsgNmId>
				<document:OrgnlCreDtTm>${OrgnlCreDtTm}</document:OrgnlCreDtTm>
			</document:OrgnlGrpInfAndSts>
			<document:OrgnlPmtInfAndSts>
				<document:OrgnlPmtInfId>${OrgnlPmtInfId}</document:OrgnlPmtInfId>
				<document:TxInfAndSts>
					<document:OrgnlInstrId>${OrgnlInstrId}</document:OrgnlInstrId>
					<document:OrgnlEndToEndId>${OrgnlEndToEndId}</document:OrgnlEndToEndId>
					<document:OrgnlUETR>${OrgnlUETR}</document:OrgnlUETR>
					<document:TxSts>RJCT</document:TxSts>
          <document:StsRsnInf>
              <document:Rsn>
                  <document:Prtry>IDRQ</document:Prtry>
              </document:Rsn>
              <document:AddtlInf>Invalid Account Number</document:AddtlInf>
          </document:StsRsnInf>
				</document:TxInfAndSts>
			</document:OrgnlPmtInfAndSts>
		</document:CdtrPmtActvtnReqStsRpt>
	</document:Document>
</FPEnvelope>`;

    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Prepared Response : **********  " + xmlBody);
    let response = await axios.post(
      "http://192.168.20.49:8080/ips_client_v1/api/digest",
      xmlBody,
      {
        headers: {
          "Content-Type": "application/xml",
          Connection: "keep-alive",
          "User-Agent": "Apache-HttpClient/4.5.14 (Java/18.0.2)",
        },
      }
    );

    RequestToPayResponseBody = response.data;
    RequestToPayResponseBody = RequestToPayResponseBody.replace("document:Sgntr", "Sgntr");

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\n Signed Pain014 : **********  " + RequestToPayResponseBody);
    res.status(200).send(response.data);
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + response.data);
  } catch (error) {
    console.error(`${formatDateWithOffset()} | ERROR | ` + error.message);
    res.status(500).json({
      error: "❌ Failed to Sign pain014 API ",
      details: error.message,
    });
  }
});


// -- Account Verification Request to IPS  --
// -- Account Verification Request to IPS  --
// -- Account Verification Request to IPS  --
app.post("/accountVerification", async (req, res) => {
  let creditorBank = req.body.creditorBank;
  let creditorAccount = req.body.creditorAccount;
  // First request Token
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Verification Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");

  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
  }

  // Procced to sign the verification API
  if (accessToken) {
    let signer_response = "";
    try {
      signer_response = await axios.post(
        "http://localhost:5000/digest/acmt023",
        {
          creditorBank: creditorBank,
          creditorAccount: creditorAccount,
        }
      );

      verificationBody = signer_response.data;
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "Verification Request Body : " + verificationBody);
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
    }

    // Send acmt.023 request to IPS
    if (verificationBody) {
      let acmt024 = "";
      try {
        acmt024 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          verificationBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        function extractReasonValue(xml, parentTag, childTag) {
          let regex = new RegExp(
            `<${parentTag}[\\s\\S]*?<${childTag}>(.*?)<\\/${childTag}>`
          );
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        let verification = extractTagValue(acmt024.data, "document:Vrfctn");
        let Id = extractTagValue(acmt024.data, "document:OrgnlId");
        let errorcode = extractReasonValue(acmt024.data, "document:Rsn", "document:Prtry");
        let creditorName = "";
        let txstatus = "PENDING";

        if (verification == "true") {
          creditorName = extractTagValue(acmt024.data, "document:Nm");
          txstatus = "COMPLETED";
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "--------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Account Verification Successful !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Id:", Id);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Vrfctn:", verification);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Nm:", creditorName);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "--------------------------------");
          
        } else {
          txstatus = "FAILED";
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "--------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Id:", Id);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Account Verification Failed !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Vrfctn:", verification);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Reason:", errorcode);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "--------------------------------");
          // res.status(200).send(verification);
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************");
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Verification Requsted Completed");
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "*******************************");
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "");

        // Record Transaction;
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: Id,
              type: "VERIF",
              status: txstatus,
              debitorBank: process.env.BIC,
              debitorAccount: " ",
              debitorName: " ",
              creditorBank: creditorBank,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: 0,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Verification Recorded to database : " + Id);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register Verification Record." + err);
        }

        res.status(200).send({
          Id,
          creditorName,
          errorcode,
        });

      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "Account verification request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});


// -- Query RTP Info Request to IPS  --
// -- Query RTP Info Request to IPS  --
// -- Query RTP Info Request to IPS  --
app.post("/queryStatus", async (req, res) => {
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Received ID: " + req.body.Id);

  let id = req.body.Id;

  if(id == 0 || id == "" || id == null || id == undefined){
    id= "XXYITBETAAXX"
  }
  let idLength = id.length
  // First request Token
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Query Status Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");

  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
  }

  if(idLength == 36){
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "Detected Id is UETR!")
    // Procced to sign the verification API
    if (accessToken) {
      let signer_response = "";
      try {
        signer_response = await axios.post(
          "http://localhost:5000/digest/pacs028/queryRTPInfo",
          {
            OrgnlUETR: id,
          }
        );

        RTPInfoBody = signer_response.data;
        
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
      }

      // Send pacs028 request to IPS
      if (RTPInfoBody) {
        let pain014 = "";
        try {
          pain014 = await axios.post(
            "http://192.168.20.45:9001/v1/iso20022/incoming",
            RTPInfoBody,
            {
              headers: {
                "Content-Type": "application/xml",
                Connection: "keep-alive",
                Authorization: "Bearer " + accessToken,
              },
              timeout: 15000,
            }
          );

          function extractTagValue(xml, tagName) {
            let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          let txStatus = extractTagValue(pain014.data, "document:TxSts");
          let AddtlInf = extractTagValue(pain014.data, "document:AddtlInf");

          console.log(`${formatDateWithOffset()} | DEBUG | ` + pain014.data)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Result from Status Request (pain014)")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "-------------------------")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Rtp Status : "  + txStatus)
          if (txStatus == "ACSP"){
            AddtlInf = "RTP is Already Paid"
          }
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Rtp Info : "  + AddtlInf)

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Query RTP Info Requsted Completed");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "");


          res.status(200).send({
            txStatus,
            AddtlInf,
          });

        } catch (err) {
          console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

          res.status(err.response?.status || 500).json({
            error: "❌ Query Status request failed",
            details: err.response?.data || err.message,
          });
        }
      }
    }
  }
  else{
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "Detected Id is TxId!")
    // Procced to sign the verification API
    if (accessToken) {
      let signer_response = "";
      try {
        signer_response = await axios.post(
          "http://localhost:5000/digest/pacs028/queryP2PInfo",
          {
            TxId: id,
          }
        );

        RTPInfoBody = signer_response.data;
        
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
      }

      // Send pacs028 request to IPS
      if (RTPInfoBody) {
        let pacs002 = "";
        try {
          pacs002 = await axios.post(
            "http://192.168.20.45:9001/v1/iso20022/incoming",
            RTPInfoBody,
            {
              headers: {
                "Content-Type": "application/xml",
                Connection: "keep-alive",
                Authorization: "Bearer " + accessToken,
              },
              timeout: 15000,
            }
          );

          function extractTagValue(xml, tagName) {
            let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractCreditorBankValue(xml) {
            let regex = /<document:InstgAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractDebitorBankValue(xml) {
            let regex = /<document:InstdAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractCreditorAccountValue(xml) {
            let regex = /<document:CdtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractDebitorAccountValue(xml) {
            let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractAmountValue(xml, tagName) {
            let regex = new RegExp(`<${tagName} Ccy="ETB">(.*?)<\\/${tagName}>`);
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          function extractCreditorNameValue(xml) {
            let regex = /<document:Cdtr>[\s\S]*?document:Nm>(.*?)<\/document:Nm>/;
            let match = xml.match(regex); 
            return match ? match[1] : null;
          }

          function extractDebitorNameValue(xml) {
            let regex = /<document:Dbtr>[\s\S]*?document:Nm>(.*?)<\/document:Nm>/;
            let match = xml.match(regex);
            return match ? match[1] : null;
          }

          let creditorBank = extractCreditorBankValue(pacs002.data);
          let debitorBank = extractDebitorBankValue(pacs002.data);
          let debitorAccount = extractDebitorAccountValue(pacs002.data);
          let creditorAccount = extractCreditorAccountValue(pacs002.data);
          let debitorName = extractDebitorNameValue(pacs002.data);
          let creditorName = extractCreditorNameValue(pacs002.data);
          let txStatus = extractTagValue(pacs002.data, "document:TxSts");
          let EndToEndId = extractTagValue(pacs002.data, "document:EndToEndId");
          let AddtlInf = extractTagValue(pacs002.data, "document:AddtlInf");
          let amount = extractAmountValue(pacs002.data, "document:InstdAmt");

          console.log(`${formatDateWithOffset()} | DEBUG | ` + pacs002.data)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Result from Status Request (pacs002)")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "-------------------------")
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "DebitorBank : "  + debitorBank)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorBank : "  + creditorBank)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorAccount : "  + debitorAccount)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorAccount : "  + creditorAccount)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorName : "  + debitorName)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorName : "  + creditorName)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "P2P Status : "  + txStatus)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Amount : "  + amount)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "TxId : "  + id)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "EndToEndId : "  + EndToEndId)
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "AddtlInf : "  + AddtlInf)

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Query P2P Info Requsted Completed");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "");


          res.status(200).send({
            debitorBank,
            debitorName,
            debitorAccount,
            creditorBank,
            creditorName,
            creditorAccount,
            txStatus,
            id,
            amount,
            AddtlInf,
            EndToEndId,
          });

        } catch (err) {
          console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

          res.status(err.response?.status || 500).json({
            error: "❌ Staus Query request failed",
            details: err.response?.data || err.message,
          });
        }
      }
    }
  }

  
  
});



// -- Return Payment Request to IPS  --
// -- Return Payment Request to IPS  --
// -- Return Payment Request to IPS  --
app.post("/returnPayment", async (req, res) => {
  let OrgnlTxId = req.body.Id;
  let txReason = "";
  let amount = "";
  let creditorName = "";
  let debitorName = "";
  let creditorAccount = "";
  let debitorAccount = "";
  let debitorBank = "";
  let creditorBank = "";
  let OrgnlEndToEndId = "";

  // First request Token
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Return Payment Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**************************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + " ");

  //Query transaction Info
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Start Query transaction Info")
  try {
      const res = await axios.post("http://localhost:5000/queryStatus", {
        Id: OrgnlTxId,
      }
    );

      const txStatus = res.data.txStatus;
      if (txStatus == "ACSC") {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Transaction is found and Successful");
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Procced to return the payment");
      }
      else{
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Transaction is not found and Status is Fail. Can not be returned.");
      }

      txReason = res.data.AddtlInf;
      amount = res.data.amount;
      creditorName = res.data.creditorName;
      debitorName = res.data.debitorName;
      creditorAccount = res.data.creditorAccount;
      debitorAccount = res.data.debitorAccount;
      debitorBank = res.data.debitorBank;
      creditorBank = res.data.creditorBank;
      OrgnlEndToEndId = res.data.EndToEndId;

      console.log(`${formatDateWithOffset()} | DEBUG | ` + "txStatus : " +  txStatus);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "txReason : " +  txReason);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorName : " +  creditorName);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorAccount : " +  creditorAccount);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorAccount : " +  debitorAccount);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorBank : " +  creditorBank);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorBank : " +  debitorBank);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "amount : " +  amount);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorName : " +  debitorName);
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlEndToEndId : " +  OrgnlEndToEndId);
      
      
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "TxStatus: " + txStatus + "\n Reason: " + txReason);
    } catch (err) {
      console.error(`${formatDateWithOffset()} | ERROR | ` + err);
    }

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "End Query transaction Info") 
  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
  }

  // Procced to sign the verification API
  if (accessToken) {
    let signer_response = "";
    try {
      signer_response = await axios.post(
        "http://localhost:5000/digest/pacs004",
        {
          OrgnlTxId: OrgnlTxId,
          OrgnlEndToEndId: OrgnlEndToEndId,
          OrgnlDebitorBank: debitorBank,
          amount: amount,
        }
      );

      returnPaymentBody = signer_response.data;
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
    }

    // Send acmt.023 request to IPS
    if (returnPaymentBody) {

      let pacs002 = "";
      try {
        pacs002 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          returnPaymentBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + pacs002.data);

        let txStatus = extractTagValue(pacs002.data, "document:TxSts");
        let RtrId = extractTagValue(pacs002.data, "document:OrgnlTxId");
        let AddtlInf = "";

        if (txStatus == "ACSC") {
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "ReturnPayment Request Accepted !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RtrId:", RtrId);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        } else {
          AddtlInf = extractTagValue(pacs002.data, "document:AddtlInf");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "ReturnPayment Request Rejected !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Rtrd:", RtrId);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "AddtlInf:", AddtlInf);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        }

        // res.status(200).json({
        //   TxId: TxId,
        //   txStatus: txStatus,
        // });

        res.status(200).send({
          txStatus,
          RtrId,
          AddtlInf,
        });
      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "❌ Push Payment Request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});



// -- PushPayment Request to IPS  --
// -- PushPayment Request to IPS  --
// -- PushPayment Request to IPS  --
app.post("/pushpayment", async (req, res) => {
  let debitorBank = bic;
  let amount = req.body.amount;
  let debitorAccount = req.body.debitorAccount;
  let creditorBank = req.body.creditorBank;
  let creditorAccount = req.body.creditorAccount;
  let creditorName = req.body.creditorName;

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "***********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send PushPayment Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "***********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");

  // First request Token
  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
  }

  // Procced to sign the pushpayment API
  if (accessToken) {
    let signer_response = "";
    try {
      signer_response = await axios.post(
        "http://localhost:5000/digest/pacs008",
        {
          amount: amount,
          creditorBank: creditorBank,
          creditorAccount: creditorAccount,
          debitorBank: debitorBank,
          debitorAccount: debitorAccount,
          creditorName: creditorName,
        }
      );

      pushpaymentBody = signer_response.data;
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
    }

    // Send pacs008 request to IPS
    if (pushpaymentBody) {
      let pacs002 = "";
      try {
        pacs002 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          pushpaymentBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + pacs002.data);

        let txStatus = extractTagValue(pacs002.data, "document:TxSts");
        let TxId = extractTagValue(pacs002.data, "document:OrgnlTxId");
        let AddtlInf = "";
        let txstatus = "";

        if (txStatus == "ACSC") {
          txstatus = "COMPLETED"
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "PushPayment Request Accepted !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "TxId:", TxId);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        } else {
          txstatus = "FAILED"
          AddtlInf = extractTagValue(pacs002.data, "document:AddtlInf>");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "PushPayment Request Rejected !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "TxId:", TxId);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "AddtlInf:", AddtlInf);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        }

        let debitorName = "";

        // Query Creditor Information from Database
        try {
            //send Account Number to query function
            let customer = await axios.post("http://localhost:5000/queryDebitor",
              {
                debitorAccount: debitorAccount,
              }
            );
            //extract the result
            debitorName = customer.data;
            
            console.log(`${formatDateWithOffset()} | DEBUG | ` + "Debitor Name : " + debitorName);
          } catch (err) {
            console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
          }
          
        // Record Transaction
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: TxId,
              type: "P2P",
              status: txstatus,
              debitorBank: debitorBank,
              debitorAccount: debitorAccount,
              debitorName: debitorName,
              creditorBank: creditorBank,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: amount,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "PushPayment Recorded to database : " + TxId);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register PushPayment Record." + err);
        }

        res.status(200).send({
          txStatus,
          TxId,
        });
      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "❌ Push Payment Request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});


// -- NormalRTP Request to IPS  --
// -- NormalRTP Request to IPS  --
// -- NormalRTP Request to IPS  --
app.post("/normalRTP", async (req, res) => {
  let amount = req.body.amount;
  let creditorBank = req.body.creditorBank;
  let creditorAccount = req.body.creditorAccount;
  let debitorBank = req.body.debitorBank;
  let debitorAccount = req.body.debitorAccount;
  let debitorName = '';
  let creditorName = '';

  // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        creditorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Creditor Name : " + creditorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }


  // Validate Debitor Account
  try {
        let res = await axios.post(
          "http://localhost:5000/accountVerification",
          {
            creditorBank: req.body.debitorBank,
            creditorAccount: req.body.debitorAccount,
          }
        );
        
        debitorName = res.data.creditorName;
    if (debitorName === '' || debitorName === null) {
      debitorName = "Debitor Name"; 
    }
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "\n\ndebitorName : " + debitorName)

  } catch (err) {
    
    console.error(`${formatDateWithOffset()} | ERROR | ` + err.data);
  }

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Normal RTP Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");

  // First request Token
  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err.response?.data || err.message);
  }

  // Procced to sign the normalRTP API
  if (accessToken) {
    try {
      let signedpain013 = await axios.post(
        "http://localhost:5000/digest/normalpain013",
        {
          amount: amount,
          creditorBank: creditorBank,
          creditorAccount: creditorAccount,
          debitorBank: debitorBank,
          debitorAccount: debitorAccount,
          debitorName: debitorName,
        }
      );

      normalRTPBody = signedpain013.data;
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err.response?.data || err.message)
    }

    // Send pain013 request to IPS
    if (normalRTPBody) {
      let pain014 = "";
      try {
        pain014 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          normalRTPBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Normal RTP Response : " + pain014.data)
        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }
        function extractCreditorBankValue(xml) {
          let regex = /<document:CdtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
          let match = xml.match(regex);
          return match ? match[1] : null;
        }
        let OrgnlInstrId = extractTagValue(pain014.data, "document:OrgnlInstrId");
        let OrgnlPmtInfId = extractTagValue(pain014.data, "document:OrgnlPmtInfId");
        let OrgnlMsgId = extractTagValue(pain014.data, "document:OrgnlMsgId");
        // let creditorBank = extractCreditorBankValue(pain014.data);

        // console.log(`${formatDateWithOffset()} | DEBUG | ` + pain014.data);

        let txStatus = extractTagValue(pain014.data, "document:TxSts");
        let UETR = extractTagValue(pain014.data, "document:OrgnlUETR");
        let AddtlInf = extractTagValue(pain014.data, "document:AddtlInf");
        let txstatus = ''

        if (txStatus == "RCVD") {
          txstatus = "RECEIVED"
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "NormalRTP Request Accepted !");
        } else {
          txstatus = "REJECTED"
          // creditorName = extractTagValue(pain014.data, "document:AddtlInf");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "NormalRTP Request Rejected !");
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + "UETR:", UETR);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlInstrId:", OrgnlInstrId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlMsgId:", OrgnlMsgId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlPmtInfId:", OrgnlPmtInfId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Status:", txStatus);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Reason:", AddtlInf);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");

        // Record Transaction
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: UETR,
              type: "RTP",
              status: txstatus,
              debitorBank: debitorBank,
              debitorAccount: debitorAccount,
              debitorName: debitorName,
              creditorBank: creditorBank,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: amount,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RequestToPay Recorded to database : " + UETR);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register RequestToPay Record." + err);
        }

        res.status(200).send({
          txStatus,
          UETR,
          AddtlInf,
          OrgnlInstrId,
          OrgnlPmtInfId,
          OrgnlMsgId,
          creditorBank,
          debitorName,
          RTPExpiredTime
        });
      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "❌ Normal RTP Request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});


// -- BlankRTP Request to IPS  --
// -- BlankRTP Request to IPS  --
// -- BlankRTP Request to IPS  --
app.post("/blankRTP", async (req, res) => {
  let amount = req.body.amount;
  let creditorBank = req.body.creditorBank;
  let creditorAccount = req.body.creditorAccount;

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Blank RTP Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "*********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");

  // First request Token
  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
  }

  // Procced to sign the blankRTP API
  if (accessToken) {
    let signer_response = "";
    try {
      signer_response = await axios.post(
        "http://localhost:5000/digest/blankpain013",
        {
          amount: amount,
          creditorBank: creditorBank,
          creditorAccount: creditorAccount,
        }
      );

      blankRTPBody = signer_response.data;
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
    }

    // Send pain013 request to IPS
    if (blankRTPBody) {
      let pain014 = "";
      try {
        pain014 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          blankRTPBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + pain014.data);

        let OrgnlInstrId = extractTagValue(pain014.data, "document:OrgnlInstrId");
        let OrgnlPmtInfId = extractTagValue(pain014.data, "document:OrgnlPmtInfId");
        let OrgnlMsgId = extractTagValue(pain014.data, "document:OrgnlMsgId");

        let txStatus = extractTagValue(pain014.data, "document:TxSts");
        let UETR = extractTagValue(pain014.data, "document:OrgnlUETR");
        let AddtlInf = extractTagValue(pain014.data, "document:AddtlInf");
        let txstatus = ''

        let creditorName  = "MERCHANT NAME";
        if (txStatus == "RCVD") {
          txstatus = "RECEIVED"
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "BlankRTP Request Accepted !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "UETR:", UETR);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        } else {
          txstatus = "REJECTED"
          // creditorName = extractTagValue(pain014.data, "document:AddtlInf>");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "BlankRTP Request Rejected !");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "UETR:", UETR);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Txsts:", txStatus);
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        }

        // Record Transaction
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: UETR,
              type: "RTP",
              status: txstatus,
              debitorBank: " ",
              debitorAccount: " ",
              debitorName:  " ",
              creditorBank: process.env.BIC,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: amount,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RequestToPay Recorded to database : " + UETR);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register RequestToPay Record." + err);
        }

        res.status(200).send({
          txStatus,
          UETR,
          AddtlInf,
          OrgnlInstrId,
          OrgnlPmtInfId,
          OrgnlMsgId,
          creditorBank,
          creditorName,
          RTPExpiredTime
        });
      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "❌ Blank RTP Request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});


// -- cancel RTP Request to IPS  --
// -- cancel RTP Request to IPS  --
// -- cancel RTP Request to IPS  --
app.post("/cancelRTP", async (req, res) => {
  let OrgnlUETR = req.body.UETR;
  let Reason = req.body.Reason;
  let AddtlInf = req.body.ReasonAddtlInf;
  let debitorBank = req.body.debitorBank;
  let OrgnlInstrId = "";
  let OrgnlPmtInfId = "";
  let OrgnlMsgId = "";
  // Validate Debitor Account
  // try {
  //       let pain014 = await axios.post(
  //         "http://localhost:5000/queryRTPInfo",
  //         {
  //           OrgnlUETR: OrgnlUETR,
  //           OrgnlInstrId: req.body.OrgnlInstrId,
  //           OrgnlMsgId: req.body.OrgnlMsgId,
  //           OrgnlPmtInfId: req.body.OrgnlPmtInfId,
  //         }
  //       );
        
        
  // } catch (err) {
    
  //   console.error(`${formatDateWithOffset()} | ERROR | ` + "Query RTP Info Error : " + err);
  // }

  
    

  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Started to send Cancel RTP Request");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "**********************************");
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "");

  // First request Token
  try {
    let token_response = await axios.post("http://localhost:5000/token");

    accessToken = token_response.data.access_token;
    refreshToken = token_response.data.refresh_token;
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "access_token: " + accessToken + "\n");
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "refresh_token: " + refreshToken + "\n");
  } catch (err) {
    console.log(`${formatDateWithOffset()} | DEBUG | ` + err.response?.data || err.message);
  }

  // Procced to sign the Cancel RTP API
  if (accessToken) {
    try {
      let signedcamt055 = await axios.post(
        "http://localhost:5000/digest/camt055",
        {
          OrgnlUETR: OrgnlUETR,
          OrgnlPmtInfId: req.body.OrgnlPmtInfId,
          OrgnlMsgId: req.body.OrgnlMsgId,
          OrgnlInstrId: req.body.OrgnlInstrId,
          Reason: Reason,
          AddtlInf: AddtlInf,
          debitorBank: debitorBank,
        }
      );

      cancelRTPBody = signedcamt055.data;
    } catch (err) {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + err.response?.data || err.message)
    }

    // Send pain013 request to IPS
    if (cancelRTPBody) {
      let camt029 = "";
      try {
        camt029 = await axios.post(
          "http://192.168.20.45:9001/v1/iso20022/incoming",
          cancelRTPBody,
          {
            headers: {
              "Content-Type": "application/xml",
              Connection: "keep-alive",
              Authorization: "Bearer " + accessToken,
            },
            timeout: 15000,
          }
        );

        function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        console.log(`${formatDateWithOffset()} | DEBUG | ` + camt029.data);

        let txStatus = extractTagValue(camt029.data, "document:Conf");
        let AddtlInf = extractTagValue(camt029.data, "document:AddtlInf");

        if (txStatus == "ACCR") {
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Cancel RTP Request Accepted !");          
        } else {
          // creditorName = extractTagValue(camt029.data, "document:AddtlInf");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Cancel RTP Request Rejected !");
        }
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "UETR:", OrgnlUETR);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlInstrId:", OrgnlInstrId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlMsgId:", OrgnlMsgId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlPmtInfId:", OrgnlPmtInfId);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Status:", txStatus);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Reason:", AddtlInf);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "------------------------------");
        // res.status(200).json({
        //   UETR: UETR,
        //   txStatus: txStatus,
        // });

        res.status(200).send({
          txStatus,
          AddtlInf,
        });
      } catch (err) {
        console.error(`${formatDateWithOffset()} | ERROR | ` + "REMOTE ERROR:", err.response?.data || err.message);

        res.status(err.response?.status || 500).json({
          error: "❌ Cancel RTP Request failed",
          details: err.response?.data || err.message,
        });
      }
    }
  }
});




app.post("/callback", async (req, res) => {
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Received Header:", req.headers);
  console.log(`${formatDateWithOffset()} | DEBUG | ` + "Received Payload:", req.body);

  let Header = req.headers;
  let Body = req.body;
  let customerStatus = "";

  // Check callback request type
  if ((Body.includes("verification_request") && Body.includes("acmt.023.001.03")) || 
      (Body.includes("payment_request") && Body.includes("pacs.008.001.10") && Body.includes(">1020304050</"))) {
    // Check if incoming message is verification request
    acmt023Header = req.headers;
    acmt023Body = req.body;
    
    if(Body.includes("pacs.008.001.10")){
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "Pacs008 request but since the Account is '1020304050', feedback acmt024 message ")
    }

    function extractTagValue(xml, tagName) {
      let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    
    function extractIdValue(xml, parentTag, childTag) {
      let regex = new RegExp(
        `<${parentTag}[\\s\\S]*?<${childTag}>(.*?)<\\/${childTag}>`
      );
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorAccountTagValue(xml) {
      let regex = /<document:Vrfctn>[\s\S]*?<document:Acct>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractComplexTagValue(xml, path) {
      let pattern = path
        .map(tag => `<${tag}[\\s\\S]*?>`)
        .join("") +
        `(.*?)` +
        path
          .reverse()
          .map(tag => `<\\/${tag}>`)
          .join("");

      let regex = new RegExp(pattern);
      let match = xml.match(regex);
      return match ? match[1].trim() : null;
    }

    
    // ******  Extract Required parameter value from the request   *******
    let OrgnlId = extractIdValue(acmt023Body, "document:Vrfctn", "document:Id");
    let OrgnlMsgId = extractTagValue(acmt023Body, "document:MsgId");
    let OrgnlBizMsgIdr = extractTagValue(acmt023Body, "header:BizMsgIdr");
    let OrgnlCreDtTm = extractTagValue(acmt023Body, "document:CreDtTm");
    let OrgnlCreDt = extractTagValue(acmt023Body, "header:CreDt");
    // let creditorAccount = extractComplexTagValue(acmt023Body.data, "document:TxSts");

    let debitorBank = extractComplexTagValue(
      acmt023Body, [
        "document:Assgnr",
        "document:Agt",
        "document:FinInstnId",
        "document:Othr",
        "document:Id"
      ]
    );

    let creditorAccount = extractCreditorAccountTagValue(acmt023Body);
    
    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryCreditor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        customerStatus = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + customerStatus);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

      let creditorName = ''
      // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        creditorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + creditorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    let acmt024_signer_response = '';
    let url = '';
    try {
        if (customerStatus == "ACTIVE" || customerStatus == "TIMEOUT") {
        // if (creditorAccount == "251960844084" || creditorAccount == "1234 acc" || creditorAccount == "12345678" || creditorAccount == "1020304050" || creditorAccount == "abc123def456g") {
          url = "http://localhost:5000/digest/acmt024/success"
        }
        else if (customerStatus == "BLOCKED" || customerStatus == "SUSPENDED" || customerStatus == "INACTIVE" || customerStatus == "CLOSED"){
          url = "http://localhost:5000/digest/acmt024/fail"
          errorcode = "BLCK"
        }
        else if (customerStatus == "INVALID"){
          url = "http://localhost:5000/digest/acmt024/fail"
          errorcode = "UNFN"
        }
        else{
          url = "http://localhost:5000/digest/acmt024/fail"
          errorcode = "UNFN"
        }
        acmt024_signer_response = await axios.post(
          url,
          {
            OrgnlId: OrgnlId,
            OrgnlMsgId: OrgnlMsgId,
            creditorAccount: creditorAccount,
            debitorBank: debitorBank,
            OrgnlCreDtTm: OrgnlCreDtTm,
            OrgnlBizMsgIdr: OrgnlBizMsgIdr,
            OrgnlCreDt: OrgnlCreDt,
          }
        );

        verificationResponseBody = acmt024_signer_response.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "verificationResponseBody : " + verificationResponseBody);
      } catch (err) {
        // console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    res.set({
      "Content-Type": "application/xml",
      "api-key": "251960844084",
    });

    if (customerStatus == "TIMEOUT" || creditorAccount == "12120012") {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "waiting for 2 min to send the request")
      await sleep(120000); // wait for 2 min
    }
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "acmt.024 response send to SVIP. Done!")

    let txstatus = ''
    if (customerStatus == "ACTIVE") {
      txstatus = "COMPLETED"
    }
    else{
      txstatus = "FAILED"
    }

    // Record Transaction;
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: OrgnlId,
              type: "VERIF",
              status: txstatus,
              debitorBank: debitorBank,
              debitorAccount: " ",
              debitorName: " ",
              creditorBank: process.env.BIC,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: 0,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "Verification Recorded to database : " + OrgnlId);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register Verification Record." + err);
        }


    res.status(200).send(verificationResponseBody);

  } 
  else if (Body.includes("payment_request") && Body.includes("pacs.008.001.10") && !(Body.includes(">1020304050</"))) {
    // Check if the incomming request is push payment
    pacs008Header = req.headers;
    pacs008Body = req.body;

    function extractTagValue(xml, tagName) {
      let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractAmountValue(xml, tagName) {
      let regex = new RegExp(`<${tagName} Ccy="ETB">(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    
    function extractTxIdValue(xml, parentTag, childTag) {
      let regex = /<document:CdtTrfTxInf>[\s\S]*?<document:PmtId>[\s\S]*?<document:TxId>(.*?)<\/document:TxId>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractUETRValue(xml, parentTag, childTag) {
      let regex = /<document:CdtTrfTxInf>[\s\S]*?<document:PmtId>[\s\S]*?<document:UETR>(.*?)<\/document:UETR>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractEndToEndIdValue(xml) {
      let regex = /<document:CdtTrfTxInf>[\s\S]*?<document:PmtId>[\s\S]*?<document:EndToEndId>(.*?)<\/document:EndToEndId>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorBankValue(xml) {
      let regex = /<document:DbtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorBankValue(xml) {
      let regex = /<document:CdtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorAccountValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorAccountValue(xml) {
      let regex = /<document:CdtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorNameValue(xml) {
      let regex = /<document:Dbtr>[\s\S]*?document:Nm>(.*?)<\/document:Nm>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorAccTypeValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:SchmeNm>[\s\S]*?<document:Prtry>(.*?)<\/document:Prtry>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractOrgnlDebitorAddValue(xml) {
      let regex = /<document:Dbtr>[\s\S]*?<document:PstlAdr>[\s\S]*?<document:AdrLine>(.*?)<\/document:AdrLine>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    
    // ******  Extract Required parameter value from the request   *******
    let OrgnlTxId = extractTxIdValue(pacs008Body);
    let OrgnlUETR = extractUETRValue(pacs008Body);
    let OrgnlEndToEndId = extractEndToEndIdValue(pacs008Body);
    let OrgnlMsgId = extractTagValue(pacs008Body, "document:MsgId");
    let OrgnlBizMsgIdr = extractTagValue(pacs008Body, "header:BizMsgIdr");
    let OrgnlCreDtTm = extractTagValue(pacs008Body, "document:CreDtTm");
    let OrgnlCreDt = extractTagValue(pacs008Body, "header:CreDt");
    let amount = extractAmountValue(pacs008Body, "document:InstdAmt");
    let debitorBank = extractDebitorBankValue(pacs008Body);
    let creditorBank = extractCreditorBankValue(pacs008Body);
    let debitorAccount = extractDebitorAccountValue(pacs008Body);
    let debitorAccType = extractDebitorAccTypeValue(pacs008Body);
    let creditorAccount = extractCreditorAccountValue(pacs008Body);
    let OrgnlDebitorAdd = extractOrgnlDebitorAddValue(pacs008Body);
    let debitorName = extractDebitorNameValue(pacs008Body);

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlTxId: " + OrgnlTxId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlUETR: " + OrgnlUETR);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlEndToEndId: " + OrgnlEndToEndId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlMsgId: " + OrgnlMsgId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlBizMsgIdr: " + OrgnlBizMsgIdr);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlCreDtTm: " + OrgnlCreDtTm);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlCreDt: " + OrgnlCreDt);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "amount: " + amount); 
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorBank: " + debitorBank); 
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorBank: " + creditorBank);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorAccount: " + creditorAccount);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorAccType: " + debitorAccType);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorName: " + debitorName);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlDebitorAdd: " + OrgnlDebitorAdd);  

    let pacs002_signer_response = '';
    let url = '';

    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryCreditor",
          {
            debitorAccount: creditorAccount,
          }
        );
        //extract the result
        customerStatus = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Detail : " + customerStatus);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    try {
        if (customerStatus == "ACTIVE" || customerStatus == "TIMEOUT") {
        // if (creditorAccount == "251960844084" || creditorAccount == "1234 acc"|| creditorAccount == "abc123def456g") {
          url = "http://localhost:5000/digest/pacs002/success"
          errorcode = "ACSC"
        }
        else if (customerStatus == "BLOCKED" || customerStatus == "SUSPENDED" || customerStatus == "INACTIVE" || customerStatus == "CLOSED"){
          url = "http://localhost:5000/digest/pacs002/fail"
          errorcode = "BLCK"
        }
        else if (customerStatus == "INVALID"){
          url = "http://localhost:5000/digest/pacs002/fail"
          errorcode = "UNFN"
        }
         else{
          url = "http://localhost:5000/digest/pacs002/fail"
          errorcode = "UNFN"
        }
        pacs002_signer_response = await axios.post(
          url,
          {
            OrgnlTxId: OrgnlTxId,
            OrgnlEndToEndId: OrgnlEndToEndId,
            OrgnlMsgId: OrgnlMsgId,
            creditorAccount: creditorAccount,
            debitorAccount: debitorAccount,
            debitorBank: debitorBank,
            debitorName: debitorName,
            creditorBank: creditorBank,
            OrgnlCreDtTm: OrgnlCreDtTm, 
            OrgnlBizMsgIdr: OrgnlBizMsgIdr,
            OrgnlCreDt: OrgnlCreDt,
            amount: amount,
            debitorAccType: debitorAccType,
            OrgnlDebitorAdd: OrgnlDebitorAdd,
          }
        );
        let txstatus = ''
        if (errorcode == "ACSC") {
          txstatus = "COMPLETED"
        }else{
          txstatus = "FAILED"
        }
        console.log("========================================")
        console.log("========================================")
        console.log("========================================")
        console.log("OrgnlUETR : " + OrgnlUETR)
        console.log("========================================")
        console.log("========================================")
        console.log("========================================")
        if (OrgnlUETR){
          // Record Transaction
          try {
            const response = await axios.post( 
              "http://localhost:5000/recordTransaction",
              {
                txID: OrgnlTxId,
                type: "P2P",
                status: txstatus,
                debitorBank: process.env.BIC,
                debitorAccount: debitorAccount,
                debitorName: debitorName,
                creditorBank: creditorBank,
                creditorAccount: creditorAccount,
                creditorName: "creditorName",
                amount: amount,
                currency: "ETB",
              }
            );

            console.log(`${formatDateWithOffset()} | DEBUG | ` + "RequestToPay Recorded to database : " + OrgnlUETR);
          } catch (err) {
            console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register RequestToPay Record." + err);
          }
        }

        pushPaymentResponseBody = pacs002_signer_response.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "pushPaymentResponseBody : " + pushPaymentResponseBody);
      } catch (err) {
        // console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    res.set({
      "Content-Type": "application/xml",
      "api-key": "251960844084",
    });

    // function extractIdTagValue(xml, tagName) {
    //   let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
    //   let match = xml.match(regex);
    //   return match ? match[1] : null;
    // }

    function extractDebtorBankValue(xml) {
      let regex = /<document:InstgAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorNameValue(xml) {
      let regex = /<document:Dbtr>[\s\S]*?<document:Nm>(.*?)<\/document:Nm>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorAccountValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

        let TxId = extractTagValue(Body, "document:TxId");
        let UETR = extractTagValue(Body, "document:UETR");
        let txStatus = extractTagValue(Body, "document:TxSts");
        let debitorBank1 = extractDebtorBankValue(Body);
        let debitorName1 = extractDebtorNameValue(Body);
        let debitorAccount1 = extractDebtorAccountValue(Body);


        console.log(`${formatDateWithOffset()} | DEBUG | ` + " TxId : " + TxId)
        console.log(`${formatDateWithOffset()} | DEBUG | ` + " txStatus : " + errorcode)
        console.log(`${formatDateWithOffset()} | DEBUG | ` + " debitorBank1 : " + debitorBank1)
        console.log(`${formatDateWithOffset()} | DEBUG | ` + " debitorName1 : " + debitorName1)
        console.log(`${formatDateWithOffset()} | DEBUG | ` + " debitorAccount1 : " + debitorAccount1)
        console.log(`${formatDateWithOffset()} | DEBUG | ` )
    
        // Update RTP Debitor
        try {
          const response = await axios.post(
            "http://localhost:5000/updateRTPDebitorInfo",
            {
              UETR: UETR,
              debitorBank: debitorBank1,
              debitorName: debitorName1,
              debitorAccount: debitorAccount1,
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RTP Debitor Info is update to the database : " + UETR);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to update RTP Debitor to the database." + err);
        }

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "Before Completion Notification is Received")
        io.emit("completion-notification", {
          TxId: TxId,
          UETR: UETR,
          txStatus: errorcode,
          debitorBank: debitorBank1,
          debitorName: debitorName1,
          debitorAccount: debitorAccount1,
        });
    
    
    if (customerStatus == "TIMEOUT" || creditorAccount == "12345678") {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "waiting for 2 min to send the request")
      await sleep(120000); // wait for 2 min
    }
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "pacs.002 response send to SVIP. Done!")

    res.status(200).send(pushPaymentResponseBody);

  }
  // If the incomming request is RTP
  else if (Body.includes("request_to_pay") && Body.includes("pain.013.001.10")) {
    pain014Header = req.headers;
    pain014Body = req.body;

    function extractTagValue(xml, tagName) {
      let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractAmountValue(xml, tagName) {
      let regex = new RegExp(`<${tagName} Ccy="ETB">(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    

    function extractDebitorBankValue(xml) {
      let regex = /<document:DbtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorBankValue(xml) {
      let regex = /<document:CdtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorAccountValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorAccountValue(xml) {
      let regex = /<document:CdtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorNameValue(xml) {
      let regex = /<document:Dbtr>[\s\S]*?document:Nm>(.*?)<\/document:Nm>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebitorAccTypeValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:SchmeNm>[\s\S]*?<document:Prtry>(.*?)<\/document:Prtry>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractOrgnlPmtInfIdValue(xml) {
      let regex = /<document:OrgnlPmtInfAndSts>[\s\S]*?<document:OrgnlPmtInfId>(.*?)<\/document:OrgnlPmtInfId>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    
    // ******  Extract Required parameter value from the request   *******
    let OrgnlUETR = extractTagValue(pain014Body, "document:UETR"); 
    let OrgnlEndToEndId = extractTagValue(pain014Body, "document:EndToEndId"); 
    let OrgnlMsgId = extractTagValue(pain014Body, "document:MsgId"); 
    let OrgnlBizMsgIdr = extractTagValue(pain014Body, "header:BizMsgIdr"); 
    let OrgnlCreDtTm = extractTagValue(pain014Body, "document:CreDtTm");
    let OrgnlCreDt = extractTagValue(pain014Body, "header:CreDt");
    let InitgPty = extractTagValue(pain014Body, "document:InitgPty");
    let amount = extractAmountValue(pain014Body, "document:InstdAmt");
    let debitorBank = extractDebitorBankValue(pain014Body);
    let creditorBank = extractCreditorBankValue(pain014Body);
    let debitorAccount = extractDebitorAccountValue(pain014Body);
    let creditorAccount = extractCreditorAccountValue(pain014Body);
    // let OrgnlCreditorAdd = extractOrgnlCreditorAddValue(pain014Body);
    // let debitorName = extractDebitorNameValue(pain014Body);

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlUETR: " + OrgnlUETR);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlEndToEndId: " + OrgnlEndToEndId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlPmtInfId: " + OrgnlPmtInfId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlInstrId: " + OrgnlInstrId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlMsgId: " + OrgnlMsgId);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlBizMsgIdr: " + OrgnlBizMsgIdr);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlCreDtTm: " + OrgnlCreDtTm);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlCreDt: " + OrgnlCreDt);
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "amount: " + amount); 
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorBank: " + debitorBank); 
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorBank: " + creditorBank);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "creditorAccount: " + creditorAccount);  
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorAccount: " + debitorAccount);  
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "debitorName: " + debitorName);  
    // console.log(`${formatDateWithOffset()} | DEBUG | ` + "OrgnlCreditorAdd: " + OrgnlCreditorAdd);  
    
    let pain014_signer_response = '';
    let url = '';
    let txStatus = '';
    let customerStatus = '';

    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryCreditor",
          {
            debitorAccount: debitorAccount,
          }
        );
        //extract the result
        customerStatus = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Customer Status : " + customerStatus);
    } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
    }

    try {
        if (customerStatus == "ACTIVE" || customerStatus == "TIMEOUT") {
        // if (debitorAccount == "251960844084" || debitorAccount == "1234 acc"|| debitorAccount == "abc123def456g") {
          url = "http://localhost:5000/digest/pain014/success";
          txStatus = "RCVD";
        }
        else if (customerStatus == "BLOCKED" || customerStatus == "SUSPENDED" || customerStatus == "INACTIVE" || customerStatus == "CLOSED") {
          url = "http://localhost:5000/digest/pain014/fail";
          errorcode = "BLCK";
          txStatus = "RJCT";
        }
        else if (customerStatus == "INVALID") {
          url = "http://localhost:5000/digest/pain014/fail";
          errorcode = "UNFN";
          txStatus = "RJCT";
        }
        else {
          url = "http://localhost:5000/digest/pain014/fail";
          errorcode = "UNFN";
          txStatus = "RJCT";
        }

        pain014_signer_response = await axios.post(
          url,
          {
            OrgnlUETR: OrgnlUETR,
            OrgnlEndToEndId: OrgnlEndToEndId,
            OrgnlMsgId: OrgnlMsgId,
            // creditorAccount: creditorAccount,
            // debitorAccount: debitorAccount,
            debitorBank: debitorBank,
            creditorBank: creditorBank,
            OrgnlCreDtTm: OrgnlCreDtTm, 
            OrgnlBizMsgIdr: OrgnlBizMsgIdr,
            OrgnlCreDt: OrgnlCreDt,
            InitgPty: InitgPty,
            OrgnlPmtInfId: OrgnlPmtInfId,
            OrgnlInstrId: OrgnlInstrId,
            // amount: amount,
            // debitorAccType: debitorAccType,
            // OrgnlCreditorAdd: OrgnlCreditorAdd,
          }
        );

        RequestToPayResponseBody = pain014_signer_response.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "RequestToPayResponseBody : " + RequestToPayResponseBody);
      } catch (err) {
        // console.log(`${formatDateWithOffset()} | DEBUG | ` + err);
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);
      }

    res.set({
      "Content-Type": "application/xml",
      "api-key": "251960844084",
    });
    
    if (customerStatus == "TIMEOUT" || creditorAccount == "12345678") {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "waiting for 2 min to send the request")
      await sleep(120000); // wait for 2 min
    }
    let txstatuss = ''

    if (customerStatus == "ACTIVE") {
      txstatuss = "RECEIVED"
    }
    else{
      txstatuss = "REJECTED"
    }

    let debitorName = ''
    // Query Creditor Information from Database
    try {
        //send Account Number to query function
        let customer = await axios.post("http://localhost:5000/queryDebitor",
          {
            debitorAccount: debitorAccount,
          }
        );
        //extract the result
        debitorName = customer.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Debitor Name : " + debitorName);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Error : " + err);  
      }
  
    // Record Transaction
        try {
          const response = await axios.post( 
            "http://localhost:5000/recordTransaction",
            {
              txID: OrgnlUETR,
              type: "RTP",
              status: txstatuss,
              debitorBank: process.env.BIC,
              debitorAccount: debitorAccount,
              debitorName: debitorName,
              creditorBank: creditorBank,
              creditorAccount: creditorAccount,
              creditorName: "creditorName",
              amount: amount,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RequestToPay Recorded to database : " + OrgnlUETR);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register RequestToPay Record." + err);
        }

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "pain.014 response send to SVIP. Done!")
    res.status(200).send(RequestToPayResponseBody);

  }
  else if (Body.includes("rtp_update") && Body.includes("pain.014.001.10")) {
    
    function extractTagValue(xml, tagName) {
          let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
          let match = xml.match(regex);
          return match ? match[1] : null;
        }

        let UETR = extractTagValue(Body, "document:OrgnlUETR");
        let txStatus = extractTagValue(Body, "document:TxSts");
        let AddtlInf = extractTagValue(Body, "document:AddtlInf");

        console.log(`${formatDateWithOffset()} | DEBUG | ` + "Ready to send Emit to front End")
        io.emit("payment-update", {
          UETR: UETR,
          txStatus: txStatus,
          AddtlInf: AddtlInf,
        });
        
        let status = ''
        if (txStatus == "RJCT") {
          status = "REJECTED"
        }else if (txStatus == "CANC"){
          status = "CANCELLED"
        }else if (txStatus == "ACSP"){
          status = "PAID"
        }else if (txStatus == "RCVD"){
          status = "RECEIVED"
        }
        // Update RTP Status
        try {
          const response = await axios.post(
            "http://localhost:5000/updateRTPStatus",
            {
              UETR: UETR,
              txStatus: status,
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "RTP Status is update to the database : " + UETR);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to update RTP status to the database." + err);
        }

    res.status(200).send("Ok");
  }
  else if (Body.includes("returnPayment_request") && Body.includes("pacs.004.001.11")) {
    function extractTagValue(xml, tagName) {
      let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractAmountValue(xml, tagName) {
      let regex = new RegExp(`<${tagName} Ccy="ETB">(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorBankValue(xml) {
      let regex = /<document:InstdAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorBankValue(xml) {
      let regex = /<document:CdtrAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    let RtrId = extractTagValue(Body, "document:RtrId");
    let OrgnlTxId = extractTagValue(Body, "document:OrgnlTxId");
    let OrgnlEndToEndId = extractTagValue(Body, "document:OrgnlEndToEndId");
    let debitorBank = extractDebtorBankValue(Body);
    let amount = extractAmountValue(Body, "document:InstdAmt");
    let creditorBank = extractCreditorBankValue(Body);
    let OrgnlMsgId = extractTagValue(Body, "document:MsgId"); 
    let OrgnlBizMsgIdr = extractTagValue(Body, "header:BizMsgIdr"); 
    let OrgnlCreDtTm = extractTagValue(Body, "document:CreDtTm");
    let OrgnlCreDt = extractTagValue(Body, "header:CreDt");
    let txStatus = ''
    let url = ''

    try {
          const res = await axios.post("http://localhost:5000/queryStatus", {
            Id: OrgnlTxId,
          }
        );
    
          txStatus = res.data.txStatus;
          if (!(txStatus == "ACSC")) {
            return
          }
              
        } catch (err) {
          console.error(err);
        } 

    try {
        if (txStatus == "ACSC") {
          url = "http://localhost:5000/digest/pacs002forReturn/success"
        }
         else{
          url = "http://localhost:5000/digest/pacs002forReturn/fail"
          errorcode = "RJCT"
        }
        const pacs002_signer_response = await axios.post(
          url,
          {
            OrgnlTxId: RtrId,
            OrgnlEndToEndId: OrgnlEndToEndId,
            OrgnlMsgId: OrgnlMsgId,
            debitorBank: debitorBank,
            creditorBank: creditorBank,
            OrgnlCreDtTm: OrgnlCreDtTm, 
            OrgnlBizMsgIdr: OrgnlBizMsgIdr,
            OrgnlCreDt: OrgnlCreDt,
            amount: amount,
          }
        );

        returnPaymentResponseBody = pacs002_signer_response.data;
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "returnPaymentResponseBody : " + returnPaymentResponseBody);
      } catch (err) {
        console.log(`${formatDateWithOffset()} | ERROR | ` + "Error : " + err);
      }
      // Update Transaction status to Returned
    try {
          const response = await axios.post(
            "http://localhost:5000/updateTxStatus",
            {
              TxId: OrgnlTxId,
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "P2P Status is update to the database : " + OrgnlTxId);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to update P2P status to the database." + err);
        }
    console.log(`${formatDateWithOffset()} | DEBUG | ` + "pacs.002 response send to SVIP. Done!")
    res.status(200).send(returnPaymentResponseBody);

  }
  else if (Body.includes("payment_response") && Body.includes("pacs.002.001.12")) {
    
    function extractTagValue(xml, tagName) {
      let regex = new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorBankValue(xml) {
      let regex = /<document:InstdAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorNameValue(xml) {
      let regex = /<document:Dbtr>[\s\S]*?<document:Pty>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorNameValue(xml) {
      let regex = /<document:Cdtr>[\s\S]*?<document:Pty>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractDebtorAccountValue(xml) {
      let regex = /<document:DbtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractAmountValue(xml, tagName) {
      let regex = new RegExp(`<${tagName} Ccy="ETB">(.*?)<\\/${tagName}>`);
      let match = xml.match(regex);
      return match ? match[1] : null;
    }
    

    function extractCreditorBankValue(xml) {
      let regex = /<document:InstgAgt>[\s\S]*?<document:FinInstnId>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

    function extractCreditorAccountValue(xml) {
      let regex = /<document:CdtrAcct>[\s\S]*?<document:Id>[\s\S]*?<document:Othr>[\s\S]*?<document:Id>(.*?)<\/document:Id>/;
      let match = xml.match(regex);
      return match ? match[1] : null;
    }

        let TxId = extractTagValue(Body, "document:OrgnlTxId");
        let txStatus = extractTagValue(Body, "document:TxSts");
        let debitorBank = extractDebtorBankValue(Body);
        let debitorName = extractDebtorNameValue(Body);
        let creditorName = extractCreditorNameValue(Body);
        let debitorAccount = extractDebtorAccountValue(Body);
        
        let amount = extractAmountValue(Body, "document:InstdAmt");
        let creditorBank = extractCreditorBankValue(Body);
        let creditorAccount = extractCreditorAccountValue(Body);
        let txstatus = '';
        
        console.log(`${formatDateWithOffset()} | DEBUG | ` + "✅ Complation Notification is Received")
        io.emit("completion-notification", {
          TxId: TxId,
          txStatus: txStatus,
          debitorBank: debitorBank,
          debitorName: debitorName,
          debitorAccount: debitorAccount,
        });

    if (customerStatus == "TIMEOUT" || creditorAccount == "12345678") {
      console.log(`${formatDateWithOffset()} | DEBUG | ` + "waiting for 2 min to send the request")
      await sleep(120000); // wait for 2 min
    }
    
    if (txStatus == "ACSC") {
      txstatus = "COMPLETED"
    }else{
      txstatus = "FAILED"
    }
    // Record Transaction
        try {
          const response = await axios.post(
            "http://localhost:5000/recordTransaction",
            {
              txID: TxId,
              type: "P2P",
              status: txstatus,
              debitorBank: debitorBank,
              debitorAccount: debitorAccount,
              debitorName: debitorName,
              creditorBank: creditorBank,
              creditorAccount: creditorAccount,
              creditorName: creditorName,
              amount: amount,
              currency: "ETB",
            }
          );

          console.log(`${formatDateWithOffset()} | DEBUG | ` + "PushPayment Recorded to database : " + TxId);
        } catch (err) {
          console.log(`${formatDateWithOffset()} | ERROR | ` + "Unable to register PushPayment Record." + err);
        }

    console.log(`${formatDateWithOffset()} | DEBUG | ` + "Echo response send to SVIP. Done!")
    res.status(200).send("Ok");
  //   res
  // .set({
  //   "X-App-Version": "1.0",
  //   "Cache-Control": "no-cache",
  //   "Content-Type": "text/plain"
  // })
  // .status(200)
  // .send("Ok");
  }
  else {
    res.status(200).send("Unkown Request Received");



  }


  
  

});





// app.listen(5000, () => {
//   console.log(`${formatDateWithOffset()} | DEBUG | ` + "Server is running on port 5000 ...");
// });
