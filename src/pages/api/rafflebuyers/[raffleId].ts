import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  const cluster_name = process.env.CLUSTER_NAME;
  const database_name = process.env.DATABASE_NAME;

  const uri = `mongodb+srv://${username}:${password}@${cluster_name}/${database_name}?retryWrites=true&w=majority`;

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const collection = client.db(database_name).collection('rafflebuyers');
    const buyers = await collection.find().toArray();

    console.log('All buyers:', buyers); // Log all buyers

    res.status(200).json(buyers);
  } catch (e) {
    console.error('Error fetching buyers:', e); // Log any errors
    res.status(500).json({ error: 'Unable to connect to database' });
  } finally {
    await client.close();
  }
}
