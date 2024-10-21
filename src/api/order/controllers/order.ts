// SDK de Mercado Pago
// import { MercadoPagoConfig, Preference } from 'mercadopago';
// import { factories } from '@strapi/strapi';

// export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  
//   async create(ctx) {
//     //@ts-ignore
//     try {
//       // Extract the necessary data from the request (products and pricing)
//       const { products } = ctx.request.body;

//       // Initialize Mercado Pago with your access token
//       const client = new MercadoPagoConfig({
//         accessToken: process.env.MERCADOPAGO_TOKEN,  // Ensure you store your access token in environment variables
//       });

//       const lineItems = await Promise.all(
//         products.map(async (product)=>{
//           const item = await strapi.service("api::product.product").findOne(product.id)
//           return{
//             price_data:{
//               currency: "cop",
//               product_data:{
//                 name: item.productName
//               },
//               unit_amount: Math.round(item.price*100)
//             },
//             quantity:1
//           }
//         })
//       );

//     } catch (error) {
//       // Handle any errors
//       strapi.log.error('Error creating Mercado Pago preference:', error);
//       ctx.throw(500, 'Error creating Mercado Pago preference');
//     }
//   },

// }));

import { MercadoPagoConfig, Preference } from 'mercadopago'; 
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({

  async create(ctx) {
    //@ts-ignore
    try {
      // Extract the necessary data from the request (orderid and products)
      const { orderid, product: products, back_urls } = ctx.request.body;

      // Log the entire request body to check its structure
      strapi.log.info('Request body:', ctx.request.body);

      // Validate input (check if products exist and are an array)
      if (!products || !Array.isArray(products) || products.length === 0) {
        return ctx.throw(400, 'Products are required');
      }

      if (!back_urls || typeof back_urls !== 'object') {
        return ctx.throw(400, 'Back URLs are required');
      }

      // Log incoming products for debugging
      strapi.log.info('Incoming products:', products);

      // Initialize Mercado Pago with your access token
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_TOKEN,  // Ensure you store your access token in environment variables
      });

      // Construct line items from products
      const lineItems = products.map((product, index) => {
        // Log each product for debugging
        strapi.log.info('Processing product:', product);

        return {
          id: (index + 1).toString(), // Generate a simple id
          title: product.productName, // Product title
          quantity: product.quantity || 1, // Use product quantity, default to 1
          unit_price: Math.round(product.price), // Product price in the right currency (COP)
        };
      });

      // Log the constructed line items for debugging
      strapi.log.info('Constructed line items:', lineItems);

      // Create a new preference
      const preference = new Preference(client);

      // Prepare the preference data
      const preferenceData = {
        items: lineItems,
        back_urls: {
          success: back_urls.success,
          failure: back_urls.failure,
          pending: back_urls.pending,
        },
        auto_return: 'approved', // Automatically return to the specified back URL after approval
        external_reference: orderid, // Include the order ID as external reference
      };

      // Log the preference data before sending to Mercado Pago
      strapi.log.info('Preference data:', preferenceData);

      // Create the preference with Mercado Pago
      const response = await preference.create({ body: preferenceData });

      // Safely access response attributes
      const { init_point, id: preferenceId } = response;

      // Send back the Mercado Pago response (init_point and preferenceId)
      ctx.send({
        init_point,
        preferenceId,
      });
    } catch (error) {
      // Handle any errors and log them
      strapi.log.error('Error creating Mercado Pago preference:', error);
      ctx.throw(500, 'Error creating Mercado Pago preference: ' + (error.message || 'Unknown error'));
    }
  },

}));
