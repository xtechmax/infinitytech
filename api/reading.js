// Vercel Serverless Function: api/reading.js
// Handles reading calculation, Gemini AI generation, preview creation, paid report delivery, and experiments

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Astro-Age-Check-Token, X-Astro-Traffic-Class, X-Astro-Cross-Sell-QA-Token'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const body = req.body || {};
        const readingId = body.readingId || req.query?.readingId || ('rdg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7));
        const lane = body.lane || 'palm_answers';
        const name = body.name || body.answers?.name || 'Valued Seeker';
        const dob = body.dob || body.answers?.dob || '1995-01-01';

        // Base Vedic & Numerology calculations
        const birthDate = new Date(dob);
        const day = isNaN(birthDate.getDate()) ? 1 : birthDate.getDate();
        const month = isNaN(birthDate.getMonth()) ? 1 : birthDate.getMonth() + 1;
        const year = isNaN(birthDate.getFullYear()) ? 1995 : birthDate.getFullYear();

        const reduceNum = (n) => {
            while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
                n = String(n).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
            }
            return n;
        };

        const lifePath = reduceNum(day + month + String(year).split('').reduce((a, b) => a + parseInt(b, 10), 0));
        const birthNumber = reduceNum(day);
        const destinyNumber = reduceNum(day * 2 + month);

        const zodiacSigns = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];
        const sunSign = zodiacSigns[month % 12];
        const moonSign = zodiacSigns[(month + 2) % 12];
        const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
        const moonNakshatra = nakshatras[(day + month) % 27];

        const apiKey = process.env.GEMINI_API_KEY || 
                       process.env.GOOGLE_AI_API_KEY || 
                       process.env.GOOGLE_API_KEY || 
                       process.env.PALM_API_KEY;

        let aiInsights = null;

        // If Gemini API Key is present, generate a personalized Vedic reading summary
        if (apiKey && req.method === 'POST') {
            try {
                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                const prompt = `You are an enlightened Vedic Astrologer & Master Palmistry Consultant.
Generate a concise reading preview for ${name}, born on ${dob}, with Life Path ${lifePath}, Sun in ${sunSign}, Moon in ${moonSign} (${moonNakshatra}).
Lane: ${lane}.

Provide 3 key life timing predictions (Career & Wealth, Love & Harmony, Health & Vitality) with a 2-4 year time window and palm line/astrology reasoning.
Format strictly as JSON:
{
  "title": "Your personal Palm & Cosmic Timeline is ready",
  "value": "Major period of acceleration and stability ahead",
  "detail": "Detailed timeline across career, wealth, love, and life transitions",
  "predictions": [
    {
      "key": "career",
      "label": "Career & Wealth Acceleration",
      "value": "Significant rise in status and independent financial growth",
      "window": "2026 – 2029",
      "why": "Strong ascending Fate Line interacting with Sun mount energy",
      "whyLabel": "Palm Evidence"
    },
    {
      "key": "love",
      "label": "Love & Emotional Harmony",
      "value": "Deepened emotional connection and inner peace",
      "window": "2026 – 2028",
      "why": "Unbroken Heart line gently arching toward Mount of Jupiter",
      "whyLabel": "Palm Evidence"
    },
    {
      "key": "vitality",
      "label": "Health & Vital Energy",
      "value": "Strong restorative life-force and stamina",
      "window": "Ongoing",
      "why": "Deep, clear Life line sweeping wide around the Venus mount",
      "whyLabel": "Palm Evidence"
    }
  ]
}`;

                const aiRes = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { response_mime_type: "application/json", temperature: 0.3 }
                    })
                });

                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    const text = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        aiInsights = JSON.parse(text);
                    }
                }
            } catch (e) {
                console.error('[Gemini Reading Generation Error]:', e);
            }
        }

        const defaultPredictions = [
            {
                key: "career",
                label: "Career & Prosperity Growth",
                value: "Major career advancement and financial expansion",
                window: "2026 – 2029",
                why: "Prominent ascending Fate Line connecting directly with the Mount of Jupiter.",
                whyLabel: "Palm Evidence"
            },
            {
                key: "love",
                label: "Love & Relationship Harmony",
                value: "High emotional synchronization and long-term stabilization",
                window: "2026 – 2028",
                why: "Smooth, unbroken Heart line curving harmoniously toward the index zone.",
                whyLabel: "Palm Evidence"
            },
            {
                key: "wellbeing",
                label: "Vitality & Life Energy",
                value: "High restorative stamina and resilience against burnout",
                window: "Continuous",
                why: "Wide, sweeping Life line framing the Mount of Venus with strong definition.",
                whyLabel: "Palm Evidence"
            }
        ];

        const responsePayload = {
            ok: true,
            readingId: readingId,
            paid: true,
            pdfUrl: 'https://palmq.shop/vastu/assets/Vastu_Bundle_Overview_1.pdf',
            product: {
                key: lane,
                title: lane === 'palm_answers' ? 'Complete Palm Life Timeline' : 'Personal Astrological Report'
            },
            chart: {
                precision: 'exact',
                sunSign: sunSign,
                moonSign: moonSign,
                moonNakshatra: moonNakshatra,
                ascendant: 'Aries'
            },
            numerology: {
                lifePath: lifePath,
                birthNumber: birthNumber,
                destinyNumber: destinyNumber,
                chaldeanNameNumber: 3
            },
            pricing: {
                amount: 199,
                compareAtAmount: 999,
                currency: 'INR'
            },
            lanePreview: {
                title: aiInsights?.title || "Your personal Palm Timeline is ready.",
                value: aiInsights?.value || "Major periods of career breakthrough and harmony mapped.",
                detail: aiInsights?.detail || "Your complete reading links visible palm line marks with cosmic timing."
            },
            experiments: {
                palmProofDensity: 'high',
                palmGatewayRecovery: 'active'
            },
            web: {
                predictions: aiInsights?.predictions || defaultPredictions
            }
        };

        return res.status(200).json(responsePayload);

    } catch (error) {
        console.error('[Server Error in /api/reading]:', error);
        return res.status(500).json({ error: 'Failed to prepare reading' });
    }
}
