import crypto from 'crypto';

const PIXEL_ID = '28712657155007563';
const CAPI_ENDPOINT = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

function sha256(value) {
    const v = String(value || '').toLowerCase().trim();
    if (!v) return null;
    return crypto.createHash('sha256').update(v).digest('hex');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { event_name, value, currency, email, phone, ip_address, user_agent, event_source_url, event_id } = req.body;
        const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN; // Set this in Vercel

        if (!META_CAPI_TOKEN) {
            console.warn('[Meta CAPI] No META_CAPI_TOKEN configured. Skipping server-side event.');
            return res.status(200).json({ status: 'skipped', reason: 'Missing token' });
        }

        const userData = {
            client_ip_address: ip_address || req.headers['x-forwarded-for']?.split(',')[0].trim(),
            client_user_agent: user_agent || req.headers['user-agent'],
        };

        if (email) userData.em = [sha256(email)];
        if (phone) userData.ph = [sha256(phone)];

        const payload = {
            data: [
                {
                    event_name: event_name || 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'website',
                    event_source_url: event_source_url || 'http://palmq.shop/Nepal',
                    user_data: userData,
                    custom_data: {
                        currency: currency || 'INR',
                        value: value ? parseFloat(value) : 0
                    }
                }
            ]
        };

        const response = await fetch(`${CAPI_ENDPOINT}?access_token=${META_CAPI_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('[Meta CAPI Response]:', data);

        return res.status(200).json({ success: response.ok, data });
    } catch (err) {
        console.error('[Meta CAPI Error]', err);
        return res.status(500).json({ error: err.message });
    }
}
