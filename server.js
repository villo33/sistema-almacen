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
// OBTENER ENTRADAS
// =========================

app.get("/api/entradas", async (req,res)=>{

    try{

        const resultado = await pool.query(`

            SELECT
                entradas.id,
                entradas.fecha,
                materiales.nombre AS material,
                entradas.cantidad,
                entradas.proveedor,
                entradas.factura,
                entradas.recibido,
                entradas.observacion

            FROM entradas

            INNER JOIN materiales
                ON entradas.material_id = materiales.id

            ORDER BY entradas.id DESC

        `);

        res.json(resultado.rows);

    }catch(error){

        console.log(error);

        res.status(500).json({
            error:"Error al obtener entradas"
        });

    }

});

// =========================
// GUARDAR ENTRADA
// =========================

app.post("/api/entradas", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            material_id,
            cantidad,
            proveedor,
            factura,
            recibido,
            observacion
        } = req.body;

        await client.query("BEGIN");

        const entrada = await client.query(

            `INSERT INTO entradas
            (
                material_id,
                proveedor_id,
                cantidad,
                proveedor,
                factura,
                recibido,
                observacion
            )

            VALUES($1,$2,$3,$4,$5,$6,$7)

            RETURNING *`,

            [
                material_id,
                null,
                cantidad,
                proveedor,
                factura,
                recibido,
                observacion
            ]

        );

        await client.query(

            `UPDATE materiales
             SET stock = stock + $1
             WHERE id = $2`,

            [
                cantidad,
                material_id
            ]

        );

        await client.query("COMMIT");

        res.json(entrada.rows[0]);

    } catch (error) {

        await client.query("ROLLBACK");

        console.log(error);

        res.status(500).json({
            error: error.message
        });

    } finally {

        client.release();

    }

});

// =========================
// OBTENER HISTORIAL
// =========================

app.get("/api/historial", async(req,res)=>{

    try{

        const resultado = await pool.query(`

            SELECT
            historial.fecha,
            historial.tipo,
            materiales.nombre AS material,
            historial.cantidad,
            historial.descripcion AS observacion

            FROM historial

            LEFT JOIN materiales
            ON historial.material_id = materiales.id

            ORDER BY historial.id DESC

        `);


        res.json(resultado.rows);


    }catch(error){

        console.log(error);


        res.status(500).json({

            error:"Error al obtener historial"

        });


    }


});

// =========================
// OBTENER PROVEEDORES
// =========================

app.get("/api/proveedores", async(req,res)=>{

    try{

        const resultado = await pool.query(
            "SELECT * FROM proveedores ORDER BY id DESC"
        );

        res.json(resultado.rows);


    }catch(error){

        console.log(error);

        res.status(500).json({
            error:"Error al obtener proveedores"
        });

    }

});




// =========================
// GUARDAR PROVEEDOR
// =========================

app.post("/api/proveedores", async(req,res)=>{


    try{


        const {

            empresa,
            nit,
            contacto,
            telefono,
            correo,
            direccion

        } = req.body;



        const resultado = await pool.query(`

            INSERT INTO proveedores

            (
            empresa,
            nit,
            contacto,
            telefono,
            correo,
            direccion
            )

            VALUES($1,$2,$3,$4,$5,$6)

            RETURNING *

        `,
        [
            empresa,
            nit,
            contacto,
            telefono,
            correo,
            direccion
        ]);



        res.json(resultado.rows[0]);



    }catch(error){


        console.log(error);


        res.status(500).json({

            error:"Error al guardar proveedor"

        });


    }


});





// =========================
// ELIMINAR PROVEEDOR
// =========================


app.delete("/api/proveedores/:id", async(req,res)=>{


    try{


        const id=req.params.id;


        await pool.query(

            "DELETE FROM proveedores WHERE id=$1",

            [id]

        );



        res.json({

            mensaje:"Proveedor eliminado"

        });



    }catch(error){


        console.log(error);


        res.status(500).json({

            error:"Error al eliminar"

        });


    }


});

// =========================
// OBTENER SALIDAS
// =========================

app.get("/api/salidas", async(req,res)=>{

    try{

        const resultado = await pool.query(`

            SELECT
            salidas.fecha,
            materiales.nombre AS material,
            salidas.cantidad,
            salidas.responsable,
            salidas.observacion

            FROM salidas

            INNER JOIN materiales
            ON salidas.material_id = materiales.id

            ORDER BY salidas.id DESC

        `);


        res.json(resultado.rows);


    }catch(error){

        console.log(error);

        res.status(500).json({

            error:"Error al obtener salidas"

        });

    }

});





// =========================
// GUARDAR SALIDA
// =========================


app.post("/api/salidas", async(req,res)=>{


    const client = await pool.connect();


    try{


        const {

            material_id,
            cantidad,
            responsable,
            observacion

        } = req.body;



        await client.query("BEGIN");



        // verificar stock

        const stock = await client.query(`

            SELECT stock 

            FROM materiales

            WHERE id=$1

        `,
        [material_id]);



        if(stock.rows.length === 0){

            throw new Error("Material no encontrado");

        }



        if(Number(stock.rows[0].stock) < Number(cantidad)){


            throw new Error("Stock insuficiente");

        }




        // guardar salida

        const salida = await client.query(`

            INSERT INTO salidas

            (
            material_id,
            cantidad,
            responsable,
            observacion
            )

            VALUES($1,$2,$3,$4)

            RETURNING *


        `,
        [
            material_id,
            cantidad,
            responsable,
            observacion
        ]);





        // restar stock

        await client.query(`

            UPDATE materiales

            SET stock = stock - $1

            WHERE id=$2

        `,
        [
            cantidad,
            material_id
        ]);





        // guardar historial

        await client.query(`

            INSERT INTO historial

            (
            tipo,
            material_id,
            cantidad,
            descripcion
            )

            VALUES($1,$2,$3,$4)

        `,
        [
            "SALIDA",
            material_id,
            cantidad,
            observacion
        ]);




        await client.query("COMMIT");



        res.json(salida.rows[0]);



    }catch(error){


        await client.query("ROLLBACK");


        console.log(error);



        res.status(500).json({

            error:error.message

        });



    }finally{


        client.release();


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