const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase } = require('../src/supaBaseClient');

// Configuración de Mercado Pago
const ACCESS_TOKEN = 'APP_USR-5406750785232016-042510-1aa931dc74f881a1605999834aa9ccdb-488524606';
const DEVICE_ID = 'NEWLAND_N950__N950NCB901498000';

async function createPaymentIntent(orderId, amount, ticketNumber) {
  try {
    const requestBody = {
      amount: amount * 100,
      additional_info: {
        external_reference: orderId,
        print_on_terminal: true,
        ticket_number: ticketNumber,
      },
    };
    const response = await axios.post(
      `https://api.mercadopago.com/point/integration-api/devices/${DEVICE_ID}/payment-intents`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error al crear el PaymentIntent: ${error.response?.data?.message || error.message}`);
  }
}

async function checkPaymentIntent(intentId) {
  try {
    const response = await axios.get(
      `https://api.mercadopago.com/point/integration-api/payment-intents/${intentId}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    return response.data.state;
  } catch (error) {
    if (error.response?.status === 404) {
      return 'not_found';
    }
    if (error.response?.status === 400) {
      return 'invalid';
    }
    throw new Error(`No se pudo verificar el estado del Payment Intent: ${error.message}`);
  }
}

async function saveOrderToSupabase(orderId, amount, externalReference, ticketNumber, intentId, status) {
  try {
    const orderData = {
      order_id: orderId,
      amount: parseFloat(amount),
      status,
      external_reference: externalReference,
      ticket_number: ticketNumber,
      intent_id: intentId,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar la orden en Supabase: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function processAndSavePayment(orderId, amount, ticketNumber) {
  try {
    if (!orderId || !amount || !ticketNumber) {
      throw new Error('Faltan parámetros: orderId, amount, o ticketNumber');
    }

    const intent = await createPaymentIntent(orderId, amount, ticketNumber);
    const intentId = intent.id;
    const mpOrderId =
      intent.order_id ||
      intent.orderId ||
      intent.order ||
      intent.additional_info?.order_id ||
      intent.additional_info?.orderId ||
      null;

    const savedOrder = await saveOrderToSupabase(
      orderId,
      amount,
      orderId,
      ticketNumber,
      intentId,
      mpOrderId,
      'OPEN'
    );

    let paymentStatus = 'OPEN';
    const maxAttempts = 12;
    let attempts = 0;

    while ((paymentStatus === 'OPEN' || paymentStatus === 'ON_TERMINAL') && attempts < maxAttempts) {
      paymentStatus = await checkPaymentIntent(intentId);

      if (paymentStatus === 'canceled' || paymentStatus === 'not_found') {
        await supabase
          .from('orders')
          .update({ status: 'CANCELED' })
          .eq('order_id', orderId);
        throw new Error('Orden cancelada o no encontrada');
      }

      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    if (paymentStatus === 'processed') {
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({ status: 'PROCESSED' })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedOrder;
    } else {
      await supabase
        .from('orders')
        .update({ status: 'FAILED' })
        .eq('order_id', orderId);
      throw new Error('Pago no confirmado');
    }
  } catch (error) {
    throw error;
  }
}

router.post('/payment', async (req, res) => {
  const { orderId, amount, ticketNumber } = req.body;

  if (!orderId || !amount || !ticketNumber) {
    return res.status(400).json({ error: 'Faltan parámetros necesarios: orderId, amount, ticketNumber.' });
  }

  try {
    const order = await processAndSavePayment(orderId, amount, ticketNumber);
    res.status(200).json({ message: 'Pago procesado exitosamente', order });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el procesamiento del pago',
      details: error.message,
    });
  }
});

module.exports = router;