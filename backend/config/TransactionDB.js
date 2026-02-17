import express from 'express'
import con from './db.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/featchTxRecord', (req, res) => {
    console.log(req.body);
    // const sql = "SELECT * FROM admin WHERE email = ? and password = ?";
    const sql = `SELECT
            t.transaction_id,
            t.transaction_type,
            t.transaction_time,
            t.status,
            t.payment_method,
            t.channel,
            a.total_amount,
            a.currency,
            d.account_number AS debtor,
            d.bank_code AS debtor,
            c.account_number AS creditor,
            c.bank_code AS creditor
            FROM transactions t
            JOIN transaction_amounts a ON t.id = a.transaction_id
            JOIN transaction_parties d ON t.id = d.transaction_id AND d.party_role='DEBTOR'
            JOIN transaction_parties c ON t.id = c.transaction_id AND c.party_role='CREDITOR'
            WHERE t.transaction_id = 'TXN20260122001' `;

    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if (err) {
            return res.json({ loginStatus: false, Error: "Database Query Error" })
        }
        else{
            if (result.length > 0) {
                console.log(result.date)
                return res.json(result.date)
            } 
            else {
                console.log("No record found!")
                return res.json({loginStatus: false, Error: "No record found!"});
            }
        }
    })
})


module.exports = router;