import Ably from 'ably';

export default async function (req, res) {
    if (req.method === 'POST') {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
        const tokenRequestData = await new Promise((resolve, reject) => {
            ably.auth.createTokenRequest({ clientId: 'tester-client-id' }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        console.log("Ably token requested");
        res.status(200).json(tokenRequestData);
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
