'use strict';

const mercadopago = require('mercadopago');

// Ensure to set the access token correctly
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_TOKEN
});

module.exports = {
  createPreference: async (order) => {
    const preference = {
      items: order.data.product.map(product => ({
        title: product.productName,
        unit_price: product.price,
        quantity: product.quantity,
      })),
      back_urls: {
        success: `${process.env.CLIENT_URL}/success`,
        failure: `${process.env.CLIENT_URL}/failure`,
        pending: `${process.env.CLIENT_URL}/pending`,
      },
      auto_return: 'approved',
    };

    try {
      const response = await mercadopago.preferences.create(preference);
      return response.body;
    } catch (error) {
      console.error('Mercado Pago preference creation error:', error);
      throw error;
    }
  },
};
