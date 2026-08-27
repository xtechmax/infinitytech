// Vercel Serverless Function: api/flow/refresh.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    return res.status(200).json({
        ok: true,
        session: 'active',
        refreshedAt: new Date().toISOString()
    });
}
