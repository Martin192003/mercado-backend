import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as mercadopago from 'mercadopago'; // 👈 Sigue usando ESModule

dotenv.config();

const app = express();

// No necesitas mercadopago.configure() porque ahora lo configuramos directamente en cada llamada

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

app.post('/api/mercadopago', async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Items inválidos" });
  }

  const preference = {
    items: items.map(item => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: "ARS"
    })),
    back_urls: {
      success: "https://example.com/success",
      failure: "https://example.com/failure",
      pending: "https://example.com/pending",
    },
    auto_return: "approved"
  };

  try {
    // Aquí pasamos el access_token directamente en la llamada
    const response = await mercadopago.preferences.create(preference, {
      access_token: process.env.MP_ACCESS_TOKEN, // Aquí es donde pasamos el access_token directamente
    });
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    if (error.response) {
      console.error("Respuesta del error:", error.response.data);
    }
    res.status(500).json({ error: "Error al generar el link de pago" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
