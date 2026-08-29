// Vercel Serverless Function: api/capture-lead.js
// Handles both Vastu lead capture notifications & Astro Yogi post-purchase email delivery with PDF attachments
import fs from 'fs';
import path from 'path';

const ADMIN_NOTIFICATION_EMAIL = 'zulak.ns@gmail.com';
const OBFUSCATED_RESEND_KEY = 'cmVfWExjZUZ5dWRfOXdzZXU0OTNyZUxVZnhEU0RwOG5CdUh0';

function getResendApiKey() {
    return process.env.RESEND_API_KEY || Buffer.from(OBFUSCATED_RESEND_KEY, 'base64').toString('utf-8');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body || {};
        const { email, whatsapp, addon1, addon2, readingId, name, postPurchase } = body;
        const resendKey = getResendApiKey();

        // 1. ASTRO YOGI POST-PURCHASE REPORT EMAIL DELIVERY
        if (postPurchase === true) {
            if (!email || !email.includes('@')) {
                return res.status(400).json({ error: 'Valid email address is required' });
            }

            const seekerName = name || 'Valued Seeker';
            const readingUrl = `https://palmq.shop/astroyogi/palm-answers?readingId=${encodeURIComponent(readingId || '')}&payment=completed`;
            const pdfDownloadUrl = 'https://palmq.shop/vastu/assets/Vastu_Bundle_Overview_1.pdf';

            // Read the guide PDF to attach
            let base64Attachment = '';
            try {
                const pdfPath = path.join(process.cwd(), 'vastu', 'assets', 'Vastu_Bundle_Overview_1.pdf');
                const fileBuffer = fs.readFileSync(pdfPath);
                base64Attachment = fileBuffer.toString('base64');
            } catch (fileErr) {
                console.error('[Astro Yogi Email] PDF read warning:', fileErr);
            }

            const astroEmailHtml = `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 20px; border: 1px solid rgba(214, 177, 106, 0.4); border-radius: 16px; background: #1c1815; color: #fdfaf6;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #e2c084; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">✨ PalmQ IND · Complete Life Timeline</h1>
                        <p style="color: #cbb89d; font-size: 13px; margin-top: 6px;">Personal Palmistry, Vedic Birth Chart & Numerology Analysis</p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #e8e2d9;">Dear <b>${seekerName}</b>,</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #d6ccbe;">
                        Your detailed PalmQ IND personal astrological reading and full life timeline have been calculated and prepared based on your biometric palm scan and birth planetary alignment.
                    </p>

                    <div style="background: rgba(214, 177, 106, 0.08); border: 1px solid rgba(214, 177, 106, 0.25); border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center;">
                        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #cbb89d; margin: 0 0 8px 0; font-weight: 600;">Direct Interactive Report Access</p>
                        <a href="${readingUrl}" style="display: inline-block; background: linear-gradient(135deg, #d6b16a 0%, #b88e40 100%); color: #1c1815; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 26px; border-radius: 8px; box-shadow: 0 4px 12px rgba(214, 177, 106, 0.25);">
                            📖 View My Life Timeline Report &rarr;
                        </a>
                        <p style="font-size: 11px; color: #a89a87; margin: 10px 0 0 0;">Bookmark this private link to access your full report anytime on any device.</p>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                        <h3 style="color: #e2c084; font-size: 14px; margin: 0 0 10px 0;">📦 What is included in your delivery:</h3>
                        <ul style="font-size: 13px; color: #d6ccbe; line-height: 1.8; margin: 0; padding-left: 18px;">
                            <li><b>Biometric Palm Mount Analysis:</b> Line of Fate, Heart, Life & Sun breakdown</li>
                            <li><b>Vedic Dasha & Transit Timeline:</b> Key upcoming planetary transits & timings</li>
                            <li><b>Chaldean Name & Birth Number Alignments:</b> Auspicious gemstone and color alignments</li>
                            <li><b>Bonus Comprehensive Guide:</b> Attached directly below as a PDF for offline reading</li>
                        </ul>
                    </div>

                    <p style="font-size: 13px; line-height: 1.5; color: #a89a87; text-align: center; margin-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px;">
                        Need assistance or clarification on your report? Reply to this email or reach us at <a href="mailto:support@palmq.shop" style="color: #d6b16a; text-decoration: none;">support@palmq.shop</a>.<br>
                        <span style="font-size: 11px; color: #786d5e;">© 2026 PalmQ IND. All rights reserved.</span>
                    </p>
                </div>
            `;

            const payload = {
                from: 'PalmQ IND <delivery@xtechmax.shop>',
                to: [email],
                reply_to: 'support@palmq.shop',
                subject: '✨ Your Personal PalmQ IND Life Timeline Report & Guide is Ready',
                html: astroEmailHtml
            };

            if (base64Attachment) {
                payload.attachments = [
                    {
                        filename: 'PalmQ_Life_Timeline_Guide.pdf',
                        content: base64Attachment
                    }
                ];
            }

            const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const resendData = await resendRes.json();
            if (!resendRes.ok) {
                console.error('[Astro Yogi Email] Failed:', resendData);
                return res.status(500).json({ error: 'Failed to send delivery email', details: resendData });
            }

            return res.status(200).json({
                ok: true,
                success: true,
                reportEmailStatus: 'sent',
                email_id: resendData?.id
            });
        }

        // 2. PRE-PAYMENT LEAD CAPTURE (SILENT CAPTURE TO ADMIN PANEL)
        const rawPhone = String(whatsapp || body.phone || '').trim();
        const cleanPhone = rawPhone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ error: 'Valid 10-digit mobile/WhatsApp number is required' });
        }

        const isAstroLead = body.funnel === 'astroyogi' || Boolean(body.lane) || Boolean(body.readingId);
        const seekerName = String(name || body.seekerName || '').trim() || 'Seeker';
        const seekerEmail = String(email || '').trim();
        const laneName = String(body.lane || 'Palm Reading').trim();

        const istTime = new Date().toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata', 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        });

        if (isAstroLead) {
            // PALMQ IND ASTROLOGY LEAD
            const astroLeadHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 550px; padding: 20px; border: 1px solid #d8be84; border-radius: 12px; background-color: #181410; color: #fdfaf6;">
                    <h2 style="color: #d8be84; margin-top: 0;">✋ New PalmQ IND Astrology Lead Captured</h2>
                    <p style="font-size: 14px; color: #d6ccbe;">A seeker entered their phone number during a reading quiz:</p>
                    
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 15px 0;">
                        <tr style="border-bottom: 1px solid #332a22;">
                            <td style="padding: 8px 0; font-weight: bold; color: #a89a87;">Seeker Name:</td>
                            <td style="padding: 8px 0; color: #ffffff; font-weight: bold;">${seekerName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #332a22;">
                            <td style="padding: 8px 0; font-weight: bold; color: #a89a87;">WhatsApp Phone:</td>
                            <td style="padding: 8px 0; color: #34d399; font-weight: bold;">+91 ${cleanPhone}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #332a22;">
                            <td style="padding: 8px 0; font-weight: bold; color: #a89a87;">Email Address:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${seekerEmail || 'Not provided'}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #332a22;">
                            <td style="padding: 8px 0; font-weight: bold; color: #a89a87;">Service / Funnel:</td>
                            <td style="padding: 8px 0; color: #d8be84; font-weight: bold;">${laneName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #a89a87;">Captured At:</td>
                            <td style="padding: 8px 0; color: #cbb89d;">${istTime} (IST)</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hello ' + seekerName + ', your PalmQ IND Astrological Life Timeline report is prepared and ready! You can complete and access your reading now at: https://palmq.shop/astroyogi')}" 
                           style="background-color: #25d366; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                            💬 Chat & Recover on WhatsApp (+91 ${cleanPhone})
                        </a>
                    </div>
                </div>
            `;

            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'PalmQ IND Leads <delivery@xtechmax.shop>',
                    to: [ADMIN_NOTIFICATION_EMAIL],
                    subject: `[PALMQ LEAD] +91${cleanPhone} | ${seekerEmail || 'no-email'} | ${seekerName}`,
                    html: astroLeadHtml
                })
            });

            return res.status(200).json({ success: true, message: 'PalmQ lead captured successfully' });
        }

        // VASTU LEAD CAPTURE
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
                        <td style="padding: 8px 0; color: #111827;">${email || 'Not provided'}</td>
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
                    <a href="https://wa.me/91${cleanPhone}?text=${encodeURIComponent('Hello, we noticed you were interested in our Practical Vastu Bundle. Do you have any questions? To  complete purchase of your vastu bundle visit now :  https://palmq.shop/vastucheckout Rs.199 only ')}" 
                       style="background-color: #25d366; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
                        💬 Chat on WhatsApp (+91 ${cleanPhone})
                    </a>
                </div>
            </div>
        `;

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Infinity Tech Leads <delivery@xtechmax.shop>',
                to: [ADMIN_NOTIFICATION_EMAIL],
                subject: `[VASTU LEAD] +91${cleanPhone} | ${email || 'no-email'}`,
                html: emailHtml
            })
        });

        return res.status(200).json({ success: true, message: 'Vastu lead captured successfully' });

    } catch (err) {
        console.error('Lead capture / delivery error:', err);
        return res.status(500).json({ error: 'Failed to process lead request' });
    }
}
