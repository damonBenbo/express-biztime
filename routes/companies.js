// Routes for companies

const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError");
const db = require("../db");

let router = new express.Router();

// GET / => list of companies

// => {companies: [{code, name, descrip}, {code, name, descripo}, ...]}

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );
        return res.json({"companies": result.rows});
    }
    catch(err) {
        return next(err);
    }
});

// GET /[code] => details on company
// => {company: {code, name, descripo, invoices: [id, ...]}}

router.get("/:code", async (req, res, next) => {
    try {
        let code = req.params.code;

        const compResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]
        );

        const invResult = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code = $1`, [code]
        );

        if (compResult.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        }

        const company = compResult.rows[0];
        const invoices = invResult.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({"company": company});
    }

    catch(err) {
        return next(err);
    }
});

// POST / => add new company
// {name, descrip} => {company: {code, name, descripo}}

router.post("/", async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({"company": results.rows[0]});
    }

    catch(err) {
        return next(err);
    }
});