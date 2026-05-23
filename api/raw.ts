import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).send('Invalid ID');
    }

    try {
        const decimalId = parseInt(id, 16);
        const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:8521';
        const response = await fetch(`${apiUrl}/paste/fetch/${decimalId}`);

        if (!response.ok) {
            return res.status(response.status).send('Paste not found');
        }

        const data = await response.json();

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send(JSON.stringify(data));
    } catch (error) {
        console.error('Error fetching paste:', error);
        res.status(500).send('Error fetching paste');
    }
}
