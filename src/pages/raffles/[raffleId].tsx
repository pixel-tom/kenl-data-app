import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Buyer {
  _id: string;
  raffleId: string;
  buyer: string;
  tickets: number[];
  createdAt: string;
  updatedAt: string;
}

const RaffleBuyers: NextPage = () => {
  const router = useRouter();
  const { raffleId } = router.query;
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (raffleId) {
      console.log(`Fetching all buyers`);

      fetch(`/api/rafflebuyers/${raffleId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('All buyers fetched from API:', data);

          // Filter buyers based on the raffleId
          const filteredBuyers = data.filter((buyer: Buyer) => buyer.raffleId === raffleId);

          console.log('Filtered buyers:', filteredBuyers);

          setBuyers(filteredBuyers);
        })
        .catch((err) => {
          console.error('Error fetching buyers:', err);
          setError('Failed to load buyers. Please try again later.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [raffleId]);

  const getTotalTickets = () => {
    return buyers.reduce((total, buyer) => total + buyer.tickets.length, 0);
  };

  const getTotalPurchasers = () => buyers.length;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Raffle Buyers</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"></div>
            <p className="ml-3 text-lg text-gray-700">Loading buyers...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="flex flex-col space-y-2 overflow-auto max-h-[50vh] bg-gray-50 p-4 rounded-lg">
              {buyers.length > 0 ? (
                buyers.map((buyer) => (
                  <div key={buyer._id} className="flex flex-row justify-between p-4 bg-white rounded-lg shadow">
                    <h1 className="text-sm font-bold text-gray-800">{buyer.buyer}</h1>
                    <p className="text-sm text-gray-600">Total Tickets: {buyer.tickets.length}</p>
                    <p className="text-sm text-gray-600">Purchased on: {new Date(buyer.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No buyers found for this raffle.</p>
              )}
            </div>

            <div className="flex flex-row justify-between items-center p-4 mt-4 bg-gray-100 text-black rounded-lg shadow">
              <h1 className="text-sm font-bold">Total Purchasers: {getTotalPurchasers()}</h1>
              <h1 className="text-sm font-bold">Total Tickets Purchased: {getTotalTickets()}</h1>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RaffleBuyers;
