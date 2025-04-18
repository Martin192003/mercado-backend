import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mercadopago from 'mercadopago';

dotenv.config();

const app = express();

console.log("MP_ACCESS_TOKEN:", process.env.MP_ACCESS_TOKEN);

// Verificación de configuración de MercadoPago
if (!process.env.MP_ACCESS_TOKEN) {
  console.error('Error: El MP_ACCESS_TOKEN no está configurado correctamente');
  process.exit(1); // Detiene el servidor si no se tiene el token
}

// Asignar el token de acceso a la configuración de MercadoPago
mercadopago.accessToken = process.env.MP_ACCESS_TOKEN;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend!');
});

// Ruta para generar QR de pago
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
    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    if (error.response) {
      console.error("Respuesta del error:", error.response.data);
    }
    res.status(500).json({ error: "Error al generar el link de pago" });
  }
});

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
