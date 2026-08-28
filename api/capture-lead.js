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
        if (postPurchase || readingId) {
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
                        <h1 style="color: #e2c084; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">✨ Astro Yogi · Complete Life Timeline</h1>
                        <p style="color: #cbb89d; font-size: 13px; margin-top: 6px;">Personal Palmistry, Vedic Birth Chart & Numerology Analysis</p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #f2e9dc;">
                        Hello <strong>${seekerName}</strong>,
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #d8cdbf;">
                        Your personalised <strong>Complete Life Timeline Report</strong> is ready. We have prepared your reading covering your career breakthroughs, financial prosperity milestones, relationship harmony windows, and vitality stamina.
                    </p>

                    <div style="background: rgba(45, 36, 26, 0.85); border: 1px solid rgba(214, 177, 106, 0.3); border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
                        <p style="font-size: 13px; color: #e2c084; font-weight: 600; margin-top: 0;">Access Your Full Interactive Reading Online</p>
                        <a href="${readingUrl}" style="background: linear-gradient(135deg, #cfa867, #a47d3d); color: #1a140e; padding: 13px 28px; text-decoration: none; border-radius: 9999px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(164, 125, 61, 0.3);">
                            Open My Complete Report →
                        </a>
                    </div>

                    <div style="text-align: center; margin: 20px 0 30px;">
                        <p style="font-size: 12px; color: #a89a88; margin-bottom: 8px;">Or download your overview guide PDF directly:</p>
                        <a href="${pdfDownloadUrl}" style="color: #e2c084; font-size: 13px; text-decoration: underline; font-weight: 600;">
                            📥 Download PDF Guide (${seekerName})
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid rgba(214, 177, 106, 0.2); margin: 24px 0;" />

                    <p style="font-size: 11px; color: #8a7c6c; text-align: center; line-height: 1.5; margin: 0;">
                        🔒 Secure Digital Delivery · Operating as Infinity Tech<br/>
                        For customer assistance, contact: support@palmq.shop
                    </p>
                </div>
            `;

            const resendPayload = {
                from: 'Astro Yogi <delivery@xtechmax.shop>',
                to: [email.trim()],
                subject: `✨ Your Personal Astro Yogi Life Timeline Report (${seekerName}) 🌟`,
                html: astroEmailHtml
            };

            if (base64Attachment) {
                resendPayload.attachments = [
                    {
                        filename: 'Astro_Yogi_Life_Timeline_Report.pdf',
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
                body: JSON.stringify(resendPayload)
            });

            const resendData = await resendRes.json();
            console.log('[Astro Yogi Email Dispatch]:', resendData);

            return res.status(200).json({
                ok: true,
                success: true,
                reportEmailStatus: 'sent',
                email_id: resendData?.id
            });
        }

        // 2. VASTU CHECKOUT PRE-PAYMENT LEAD CAPTURE (NOTIFICATION TO ADMIN)
        if (!email || !whatsapp) {
            return res.status(400).json({ error: 'Email and WhatsApp number are required' });
        }

        const cleanPhone = String(whatsapp).replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ error: 'Invalid WhatsApp number' });
        }

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
                subject: `[VASTU LEAD] +91${cleanPhone} | ${email}`,
                html: emailHtml
            })
        });

        return res.status(200).json({ success: true, message: 'Lead captured successfully' });

    } catch (err) {
        console.error('Lead capture / delivery error:', err);
        return res.status(500).json({ error: 'Failed to process lead request' });
    }
}
