import Ably from 'ably/promises';

export default async function (req, res) {
    if (req.method === 'POST') {
        const ably = new Ably.Rest( process.env.ABLY_API_KEY );
        const tokenRequestData = await ably.auth.createTokenRequest({ clientId: 'tester-client-id' });

        res.status(200).json(tokenRequestData);
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
