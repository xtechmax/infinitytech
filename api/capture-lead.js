// Vercel Serverless Function: api/capture-lead.js
// Captures leads / abandoned checkout data as soon as phone/email are typed

const ADMIN_NOTIFICATION_EMAIL = 'zulak.ns@gmail.com';
const OBFUSCATED_RESEND_KEY = 'cmVfWExjZUZ5dWRfOXdzZXU0OTNyZUxVZnhEU0RwOG5CdUh0';

function getResendApiKey() {
    return process.env.RESEND_API_KEY || Buffer.from(OBFUSCATED_RESEND_KEY, 'base64').toString('utf-8');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, whatsapp, addon1, addon2, page } = req.body || {};

        if (!email || !whatsapp) {
            return res.status(400).json({ error: 'Email and WhatsApp number are required' });
        }

        const cleanPhone = whatsapp.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ error: 'Invalid WhatsApp number' });
        }

        const resendKey = getResendApiKey();
        const istTime = new Date().toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata', 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        });

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 550px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fafafa;">
                <h2 style="color: #2563eb; margin-top: 0;">🏡 New Lead / Abandoned Checkout Captured</h2>
                <p style="font-size: 14px; color: #374151;">A visitor typed their details on the checkout page before payment:</p>
                
                <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 15px 0;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">WhatsApp Phone:</td>
                        <td style="padding: 8px 0; color: #111827; font-weight: bold;">+91 ${cleanPhone}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email Address:</td>
                        <td style="padding: 8px 0; color: #111827;">${email}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Selected Addons:</td>
                        <td style="padding: 8px 0; color: #111827;">
                            ${addon1 ? '✅ 50 Vastu Tips (+₹99)<br>' : ''}
                            ${addon2 ? '✅ Element Cures (+₹49)<br>' : ''}
                            ${!addon1 && !addon2 ? 'None' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Captured At:</td>
                        <td style="padding: 8px 0; color: #6b7280;">${istTime} (IST)</td>
                    </tr>
                </table>

                <div style="margin-top: 20px; text-align: center;">
                    <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hello, we noticed you were interested in our Practical Vastu Bundle. Do you have any questions? To  complete purchase of your vastu bundle visit now :  https://infinitytech-six.vercel.app/vastucheckout Rs.199 only ')}" 
                       style="background-color: #25d366; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
                        💬 Chat on WhatsApp (+91 ${cleanPhone})
                    </a>
                </div>
            </div>
        `;

        // Send lead capture notification via Resend
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Infinity Tech Leads <delivery@xtechmax.shop>',
                to: [ADMIN_NOTIFICATION_EMAIL],
                subject: `[VASTU LEAD] +91${cleanPhone} | ${email}`,
                html: emailHtml
            })
        });

        return res.status(200).json({ success: true, message: 'Lead captured successfully' });

    } catch (err) {
        console.error('Lead capture error:', err);
        return res.status(500).json({ error: 'Failed to capture lead' });
    }
}
