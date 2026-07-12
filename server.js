require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// =========================
// RUTA PRINCIPAL
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
// OBTENER MATERIALES
// =========================

app.get("/api/materiales", async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT * FROM materiales ORDER BY id DESC"
        );

        res.json(resultado.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error al obtener materiales"
        });

    }

});

// =========================
// GUARDAR MATERIAL
// =========================

app.post("/api/materiales", async (req, res) => {

    try {

        const {
            codigo,
            nombre,
            categoria,
            unidad,
            stock,
            stock_minimo,
            ubicacion
        } = req.body;

        const resultado = await pool.query(

            `INSERT INTO materiales
            (codigo,nombre,categoria,unidad,stock,stock_minimo,ubicacion)

            VALUES($1,$2,$3,$4,$5,$6,$7)

            RETURNING *`,

            [
                codigo,
                nombre,
                categoria,
                unidad,
                stock,
                stock_minimo,
                ubicacion
            ]

        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error al guardar"
        });

    }

});

// =========================
// EDITAR MATERIAL
// =========================

app.put("/api/materiales/:id", async (req, res) => {

    try {

        const id = req.params.id;

        const {

            codigo,
            nombre,
            categoria,
            unidad,
            stock,
            stock_minimo,
            ubicacion

        } = req.body;

        const resultado = await pool.query(

            `UPDATE materiales SET

            codigo=$1,
            nombre=$2,
            categoria=$3,
            unidad=$4,
            stock=$5,
            stock_minimo=$6,
            ubicacion=$7

            WHERE id=$8

            RETURNING *`,

            [
                codigo,
                nombre,
                categoria,
                unidad,
                stock,
                stock_minimo,
                ubicacion,
                id
            ]

        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error al editar"
        });

    }

});

// =========================
// ELIMINAR MATERIAL
// =========================

app.delete("/api/materiales/:id", async (req, res) => {

    try {

        const id = req.params.id;

        await pool.query(

            "DELETE FROM materiales WHERE id=$1",

            [id]

        );

        res.json({
            mensaje: "Material eliminado"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Error al eliminar"
        });

    }

});

// =========================
// SERVIDOR
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("----------------------------------");
    console.log(" SISTEMA DE ALMACÉN ");
    console.log("----------------------------------");
    console.log("Servidor iniciado");
    console.log("http://localhost:" + PORT);
    console.log("----------------------------------");

});