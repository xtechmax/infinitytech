// Vercel Serverless Function: api/age-check.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
    const token = 'astro_age_valid_' + Date.now();

    return res.status(200).json({
        ageCheckToken: token,
        expiresAt: expiresAt,
        minimumAge: 18,
        maximumAge: 120
    });
}
