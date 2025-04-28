const axios = require("axios");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const items = req.body.items;

  // Validación básica
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No se recibieron productos" });
  }

  console.log("Recibí del frontend:", items);

  try {
    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
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
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    res.status(200).json({ init_point: response.data.init_point });
  } catch (error) {
    console.error(
      "Error al crear preferencia:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "No se pudo crear la preferencia con Mercado Pago",
      details: error.response ? error.response.data : error.message,
    });
  }
}
