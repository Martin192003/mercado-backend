import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mercadopago from 'mercadopago';

dotenv.config();

const app = express();

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder parsear JSON en las solicitudes

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

// 👉 Ruta para generar QR de pago
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
    })),
    back_urls: {
      success: "https://example.com/success",
      failure: "https://example.com/failure",
      pending: "https://example.com/pending",
    },
    auto_return: "approved"
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point }); // 👈 Este es el link para el QR
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al generar el link de pago" });
  }
});

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
