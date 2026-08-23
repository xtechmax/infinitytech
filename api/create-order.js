// Vercel Serverless Function: api/create-order.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, whatsapp, addon1, addon2 } = req.body;

        if (!email || !whatsapp) {
            return res.status(400).json({ error: 'Email and WhatsApp number are required' });
        }

        // Calculate amount
        let amount = 199;
        if (addon1) amount += 99;
        if (addon2) amount += 49;

        // Cashfree Credentials (loaded securely from Vercel Environment Variables)
        const clientId = process.env.CASHFREE_CLIENT_ID;
        const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return res.status(500).json({ 
                error: 'Cashfree API Keys are not configured in Vercel Environment Variables. Please set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET.' 
            });
        }

        const orderId = 'order_' + Date.now();
        const customerId = 'cust_' + Date.now();

        // Call Cashfree Orders API
        const cashfreeResponse = await fetch('https://api.cashfree.com/pg/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': clientId,
                'x-client-secret': clientSecret
            },
            body: JSON.stringify({
                order_amount: amount,
                order_currency: 'INR',
                order_id: orderId,
                customer_details: {
                    customer_id: customerId,
                    customer_phone: whatsapp.length === 10 ? '91' + whatsapp : whatsapp,
                    customer_email: email
                },
                order_meta: {
                    return_url: 'https://infinitytech-six.vercel.app/vastucheckout/success?order_id={order_id}'
                }
            })
        });

        const responseData = await cashfreeResponse.json();

        if (!cashfreeResponse.ok) {
            console.error('Cashfree API error:', responseData);
            return res.status(500).json({ error: responseData.message || 'Failed to create order with Cashfree' });
        }

        return res.status(200).json({
            payment_session_id: responseData.payment_session_id,
            order_id: responseData.order_id
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
