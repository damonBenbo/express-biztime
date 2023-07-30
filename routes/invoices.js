// routes for invoices

const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

// GET / => list of invoices
// => {invoices: [{id, comp_code}, ...]}

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
        );

        return res.json({"invoices": result.rows});
    }

    catch(err) {
        return next(err);
    }
});

/**GET /[id] => detail on invoice
 * 
 * => {invoices: {id,
 *                amt,
 *                paid,
 *                add_date,
 *                paid_date,
 *                company: {code, name, description}}}
 * 
 */

router.get("/:id", async (req, res, next) => {
    try {
        let id = req.params.id;

        const result = await db.query(
            `SELECT i.id,
            i.comp_code,
            i.amt,
            i.paid,
            i.add_date
            i.paid_date,
            c.name,
            c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`, 404);
    }

    const data = result.rows[0];
    const invoice = {
        id: data.id,
        company: {
            code: data.comp_code,
            name: data.name,
            description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
    };

    return res.json({"invoice": invoice});
    }

    catch(err) {
        return next(err);
    }
});