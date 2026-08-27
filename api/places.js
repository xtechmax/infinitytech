// Vercel Serverless Function: api/places.js
// Provides location search recommendations for birth place lookup

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const q = String(req.query.q || '').trim().toLowerCase();

    const commonPlaces = [
        { label: "New Delhi, Delhi, India", city: "New Delhi", country: "India", lat: 28.6139, lng: 77.2090 },
        { label: "Mumbai, Maharashtra, India", city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
        { label: "Bengaluru, Karnataka, India", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
        { label: "Kolkata, West Bengal, India", city: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639 },
        { label: "Chennai, Tamil Nadu, India", city: "Chennai", country: "India", lat: 13.0827, lng: 80.2707 },
        { label: "Hyderabad, Telangana, India", city: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867 },
        { label: "Pune, Maharashtra, India", city: "Pune", country: "India", lat: 18.5204, lng: 73.8567 },
        { label: "Ahmedabad, Gujarat, India", city: "Ahmedabad", country: "India", lat: 23.0225, lng: 72.5714 },
        { label: "Jaipur, Rajasthan, India", city: "Jaipur", country: "India", lat: 26.9124, lng: 75.7873 },
        { label: "Lucknow, Uttar Pradesh, India", city: "Lucknow", country: "India", lat: 26.8467, lng: 80.9462 },
        { label: "Patna, Bihar, India", city: "Patna", country: "India", lat: 25.5941, lng: 85.1376 },
        { label: "Chandigarh, Punjab, India", city: "Chandigarh", country: "India", lat: 30.7333, lng: 76.7794 },
        { label: "London, Greater London, United Kingdom", city: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
        { label: "New York, NY, United States", city: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
        { label: "Dubai, United Arab Emirates", city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
        { label: "Singapore, Singapore", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 }
    ];

    let filtered = commonPlaces;
    if (q) {
        filtered = commonPlaces.filter(p => p.label.toLowerCase().includes(q));
        if (!filtered.length) {
            // Dynamic entry for unmatched search
            filtered = [{
                label: q.charAt(0).toUpperCase() + q.slice(1) + ", India",
                city: q,
                country: "India",
                lat: 20.5937,
                lng: 78.9629
            }];
        }
    }

    return res.status(200).json({ places: filtered });
}
