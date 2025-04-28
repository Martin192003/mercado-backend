const express = require("express");
const router = express.Router();
const axios = require("axios");

// Ruta para crear la preferencia
router.post("/crear-preferencia", async (req, res) => {
    const items = req.body.items;
  
    // Validación básica de que los items estén presentes
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "No se recibieron productos" });
    }
  
    console.log("Recibí del frontend:", items);
  
    try {
        // Realizar la solicitud POST a Mercado Pago
        const response = await axios.post(
            "https://pruebarender-3tc4.onrender.com/checkout/preferences",
            {
                items: items.map((item) => ({
                    title: item.nombre,
                    quantity: item.cantidad,  
                    unit_price: item.precio,
                    currency_id: "ARS",
                })),
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,  // Usando el token de acceso
                },
            }
        );
  
        // Respuesta con el enlace de pago de Mercado Pago
        res.json({ init_point: response.data.init_point });
    } catch (error) {
        console.error("Error al crear preferencia:", error.response ? error.response.data : error.message);
        res.status(500).json({
            error: "No se pudo crear la preferencia con Mercado Pago",
            details: error.response ? error.response.data : error.message,
        });
    }
});

module.exports = router;