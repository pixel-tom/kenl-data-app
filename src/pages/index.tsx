import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { debounce } from 'lodash';

interface Prize {
  tokenName: string;
  token: string;
  tokenImg: string;
  amount: number;
  isClaimed: boolean;
  _id: string;
}

interface Raffle {
  _id: string;
  name: string;
  creator: string;
  startTime: string;
  floorPrice: string;
  isDeleted: boolean;
}

const Home: NextPage = () => {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [filteredRaffles, setFilteredRaffles] = useState<Raffle[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [creator, setCreator] = useState('');
  const [floorPrice, setFloorPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/raffles')
      .then((response) => response.json())
      .then((data) => {
        const sortedRaffles = data.sort(
          (a: Raffle, b: Raffle) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setRaffles(sortedRaffles);
        setFilteredRaffles(sortedRaffles);
      })
      .catch((err) => {
        setError('Failed to load raffles. Please try again later.');
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearchDebounced = debounce(() => {
    const filtered = raffles.filter((raffle) => {
      const raffleStartTime = new Date(raffle.startTime).toISOString();
      const selectedStartDate = startDate
        ? startDate.toISOString().replace("Z", "")
        : '';
      const selectedEndDate = endDate
        ? endDate.toISOString().replace("Z", "")
        : '';

      return (
        (!selectedStartDate || raffleStartTime >= selectedStartDate) &&
        (!selectedEndDate || raffleStartTime <= selectedEndDate) &&
        raffle.creator.toLowerCase().includes(creator.toLowerCase()) &&
        (!floorPrice || parseFloat(raffle.floorPrice) >= parseFloat(floorPrice)) &&
        !raffle.isDeleted
      );
    });

    setFilteredRaffles(filtered);
  }, 300);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    handleSearchDebounced();
  };

  const getTotalRaffles = () => filteredRaffles.length;

  const getTotalFloorPrice = () => {
    return filteredRaffles.reduce((total, raffle) => {
      return total + parseFloat(raffle.floorPrice);
    }, 0);
  };

  const copyOwnerAddresses = () => {
    const ownerAddresses = filteredRaffles.map((raffle) => raffle.creator).join('\n');
    navigator.clipboard.writeText(ownerAddresses);
    alert('Owner addresses copied to clipboard!');
  };

  const navigateToRaffle = (raffleId: string) => {
    router.push(`/raffles/${raffleId}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Raffle Dashboard</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"></div>
            <p className="ml-3 text-lg text-gray-700">Loading raffles...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <form onSubmit={handleSearch} className="flex flex-wrap justify-between space-y-4 md:space-y-0 mb-6">
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 mb-1">Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="p-2 rounded border"
                  placeholderText="Select start date"
                />
              </div>
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 mb-1">End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="p-2 rounded border"
                  placeholderText="Select end date"
                />
              </div>
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 mb-1">Creator Address:</label>
                <input
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="Creator Address"
                  className="p-2 rounded border"
                />
              </div>
              <div className="flex flex-col w-full md:w-auto">
                <label className="text-gray-700 mb-1">Floor Price:</label>
                <input
                  type="text"
                  value={floorPrice}
                  onChange={(e) => setFloorPrice(e.target.value)}
                  placeholder="Floor Price"
                  className="p-2 rounded border"
                />
              </div>
              <button type="submit" className="p-2 bg-blue-500 text-white rounded w-full md:w-auto mt-4 md:mt-8">
                Search
              </button>
            </form>

            <div className="flex flex-col space-y-2 overflow-auto max-h-[50vh] bg-gray-50 p-4 rounded-lg">
              {filteredRaffles.length > 0 ? (
                filteredRaffles.map((raffle) => (
                  <div 
                    key={raffle._id} 
                    className="flex flex-row justify-between p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-100"
                    onClick={() => navigateToRaffle(raffle._id)}
                  >
                    <h1 className="text-sm font-bold text-gray-800">{raffle.name}</h1>
                    <p className="text-sm text-gray-600">{raffle.creator}</p>
                    <p className="text-sm text-gray-600">{new Date(raffle.startTime).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-gray-800">{raffle.floorPrice} SOL</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No raffles found.</p>
              )}
            </div>

            <div className="flex flex-row justify-between items-center p-4 mt-4 bg-gray-100 text-black rounded-lg shadow">
              <h1 className="text-sm font-bold">Total Raffles: {getTotalRaffles()}</h1>
              <h1 className="text-sm font-bold">Total Floor Price: {getTotalFloorPrice().toFixed(2)} SOL</h1>
              <button
                type="button"
                className="p-2 bg-blue-500 text-white rounded"
                onClick={copyOwnerAddresses}
              >
                Copy Owner Addresses
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
