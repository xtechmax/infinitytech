// Vercel Serverless Function: api/x-capi.js
// X (Twitter) Conversions API — server-side event forwarding for pixel: reryo
// Docs: https://developer.x.com/en/docs/twitter-ads-api/measurement/web-conversions/conversion-api

import crypto from 'crypto';

const X_PIXEL_ID = 'reryo';
const X_CAPI_TOKEN = 'FTjMpLnV00uqjSPXbHkxDKpcs7HGjT-IBqfr8lYiRcJwEOWgz9zJrBNvekvlW8zpe1I1heTmxbvWJu3uxJ5vzzM';
const X_CAPI_ENDPOINT = `https://ads-api.x.com/12/measurement/conversions/${X_PIXEL_ID}`;

/**
 * SHA-256 hash a string (for PII normalization per X CAPI spec).
 * Empty or whitespace-only values return null so we don't send garbage hashes.
 */
function sha256(value) {
    const v = String(value || '').toLowerCase().trim();
    if (!v) return null;
    return crypto.createHash('sha256').update(v).digest('hex');
}

/**
 * Normalize a phone number for hashing:
 *  - strip all non-digits
 *  - ensure it starts with country code (default +91 India)
 */
function normalizePhone(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length > 10) return `+${digits}`;
    return null;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const body = req.body || {};
        const {
            event_name,       // 'Purchase' | 'InitiateCheckout' | 'PageView'
            conversion_id,    // order_id or session id for deduplication
            value,            // purchase value in INR (number)
            currency,         // 'INR'
            email,
            phone,
            ip_address,
            user_agent,
            event_source_url,
            twclid,           // X click ID from URL param (if present)
        } = body;

        if (!event_name) {
            return res.status(400).json({ error: 'event_name is required' });
        }

        // --- Build X CAPI event_id: tw-{pixel_id}-{event_slug}
        // Twitter requires event IDs from the Events Manager matching
        const EVENT_ID_MAP = {
            'Purchase': `tw-${X_PIXEL_ID}-purchase`,
            'InitiateCheckout': `tw-${X_PIXEL_ID}-initiatecheckout`,
            'PageView': `tw-${X_PIXEL_ID}-pageview`,
        };
        const eventId = EVENT_ID_MAP[event_name] || `tw-${X_PIXEL_ID}-custom`;

        // --- Hash PII for identity resolution
        const hashedEmail = sha256(email);
        const normalizedPhone = normalizePhone(phone);
        const hashedPhone = sha256(normalizedPhone);

        // Build identifiers array — at least one required
        const identifiers = {};
        if (twclid) identifiers.twclid = String(twclid).trim();
        if (hashedEmail) identifiers.hashed_email = hashedEmail;
        if (hashedPhone) identifiers.hashed_phone_number = hashedPhone;
        if (ip_address) identifiers.ip_address = String(ip_address).trim();
        if (user_agent) identifiers.user_agent = String(user_agent).trim();

        // Fallback: grab IP from Vercel headers if not provided
        if (!identifiers.ip_address) {
            const forwarded = req.headers['x-forwarded-for'];
            if (forwarded) identifiers.ip_address = forwarded.split(',')[0].trim();
        }

        // Fallback: grab UA from request headers
        if (!identifiers.user_agent && req.headers['user-agent']) {
            identifiers.user_agent = req.headers['user-agent'];
        }

        if (Object.keys(identifiers).length === 0) {
            // Need at least one identifier
            return res.status(400).json({ error: 'At least one identifier (email, phone, ip+ua, or twclid) is required' });
        }

        // --- Build conversion payload
        const conversionPayload = {
            conversion_time: new Date().toISOString(),
            event_id: eventId,
            event_source_url: event_source_url || 'https://palmq.shop/astroyogi',
            identifiers: [identifiers],
        };

        // Add optional deduplication ID (matches web pixel event)
        if (conversion_id) {
            conversionPayload.conversion_id = String(conversion_id).trim();
        }

        // Add value/currency for Purchase
        if (event_name === 'Purchase' && value) {
            conversionPayload.value = parseFloat(value) || 0;
            conversionPayload.currency = currency || 'INR';
        }

        // --- POST to X Conversions API
        const xResponse = await fetch(X_CAPI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Pixel-Token': X_CAPI_TOKEN,
            },
            body: JSON.stringify({
                conversions: [conversionPayload],
            }),
        });

        const xData = await xResponse.json().catch(() => ({ raw: xResponse.status }));

        if (!xResponse.ok) {
            console.error('[X CAPI Error]', xResponse.status, JSON.stringify(xData));
            return res.status(200).json({ ok: false, x_status: xResponse.status, error: xData });
        }

        console.log(`[X CAPI] Sent ${event_name} event successfully`, { conversion_id, eventId });
        return res.status(200).json({ ok: true, event_name, eventId, x_status: xResponse.status, data: xData });

    } catch (error) {
        console.error('[X CAPI Internal Error]:', error.message);
        return res.status(200).json({ ok: false, error: error.message });
    }
}
