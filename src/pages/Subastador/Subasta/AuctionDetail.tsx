import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { formatDistanceToNow, isPast, isAfter } from 'date-fns';
import { 
  Gavel, 
  Timer, 
  DollarSign, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Bid {
  id: string;
  userId: string;
  amount: number;
  timestamp: string;
  userEmail: string;
}

interface AutoBid {
  enabled: boolean;
  maxAmount: number;
}

interface Auction {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  minIncrement: number;
  reservePrice: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  bidCount: number;
  bids: Bid[];
  winnerId?: string;
}

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [autoBid, setAutoBid] = useState<AutoBid>({
    enabled: false,
    maxAmount: 0
  });
  const [timeLeft, setTimeLeft] = useState<string>('');

  const fetchAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch auction details');
      const data = await response.json();
      setAuction(data);
    } catch (err) {
      setError('Failed to load auction details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (!auction) return;

    const updateTimeLeft = () => {
      const end = new Date(auction.endDate);
      if (isPast(end)) {
        setTimeLeft('Auction ended');
        return;
      }
      setTimeLeft(formatDistanceToNow(end, { addSuffix: true }));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handleBid = async () => {
    try {
      const response = await fetch(`/api/auctions/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(bidAmount) }),
      });

      if (!response.ok) throw new Error('Failed to place bid');
      
      await fetchAuction();
      setBidAmount('');
    } catch (err) {
      setError('Failed to place bid');
    }
  };

  const handleAutoBid = async () => {
    try {
      const response = await fetch(`/api/auctions/${id}/auto-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(autoBid),
      });

      if (!response.ok) throw new Error('Failed to set auto-bid');
      
      await fetchAuction();
    } catch (err) {
      setError('Failed to set auto-bid');
    }
  };

  const isAuctionActive = auction?.status === 'active';
  const canBid = isAuctionActive && user?.userType === 'bidder';
  const minimumBid = auction ? auction.currentPrice + auction.minIncrement : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Auction</h2>
            <p className="text-red-600">{error || 'Auction not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{auction.productName}</h1>
          <p className="mt-2 text-gray-600">{auction.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main auction info */}
          <div className="lg:col-span-2">
            <Card className="animate-slide-up">
              <CardBody>
                <div className="aspect-w-16 aspect-h-9 mb-6">
                  <img
                    src={auction.productImage}
                    alt={auction.productName}
                    className="rounded-lg object-cover w-full h-96"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Current Price</div>
                    <div className="text-xl font-semibold text-primary-600 flex items-center gap-1">
                      <DollarSign size={20} />
                      {auction.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Time Remaining</div>
                    <div className="text-xl font-medium flex items-center gap-1">
                      <Timer size={20} className="text-gray-400" />
                      {timeLeft}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Total Bids</div>
                    <div className="text-xl font-medium flex items-center gap-1">
                      <Users size={20} className="text-gray-400" />
                      {auction.bidCount}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Min Increment</div>
                    <div className="text-xl font-medium flex items-center gap-1">
                      <TrendingUp size={20} className="text-gray-400" />
                      ${auction.minIncrement.toFixed(2)}
                    </div>
                  </div>
                </div>

                {canBid && (
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
                    <div className="space-y-4">
                      <Input
                        label={`Bid Amount (Min: $${minimumBid.toFixed(2)})`}
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minimumBid}
                        step={auction.minIncrement}
                        fullWidth
                      />
                      <Button
                        variant="primary"
                        onClick={handleBid}
                        icon={<Gavel size={20} />}
                        fullWidth
                      >
                        Place Bid
                      </Button>

                      <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Auto Bidding</h3>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="enableAutoBid"
                              checked={autoBid.enabled}
                              onChange={(e) => setAutoBid({ ...autoBid, enabled: e.target.checked })}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="enableAutoBid" className="ml-2 block text-sm text-gray-700">
                              Enable Auto Bidding
                            </label>
                          </div>
                          {autoBid.enabled && (
                            <>
                              <Input
                                label="Maximum Bid Amount"
                                type="number"
                                value={autoBid.maxAmount || ''}
                                onChange={(e) => setAutoBid({ ...autoBid, maxAmount: parseFloat(e.target.value) })}
                                min={minimumBid}
                                fullWidth
                              />
                              <Button
                                variant="primary"
                                onClick={handleAutoBid}
                                icon={<TrendingUp size={20} />}
                                fullWidth
                              >
                                Set Auto Bid
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Bid history */}
          <div className="lg:col-span-1">
            <Card className="animate-slide-up">
              <CardHeader>
                <h2 className="text-xl font-semibold">Bid History</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {auction.bids.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No bids yet</p>
                  ) : (
                    auction.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`p-4 rounded-lg border ${
                          bid.userId === auction.winnerId
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-900">
                              ${bid.amount.toFixed(2)}
                            </span>
                            <p className="text-sm text-gray-600">{bid.userEmail}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
                            </div>
                            {bid.userId === auction.winnerId && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Auction Status */}
            <Card className="mt-6 animate-slide-up">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Auction Status</h3>
                    <p className="text-sm text-gray-600">
                      {auction.status === 'upcoming' && 'Starts'}
                      {auction.status === 'active' && 'Ends'}
                      {auction.status === 'ended' && 'Ended'}
                      {' '}
                      {formatDistanceToNow(
                        new Date(auction.status === 'upcoming' ? auction.startDate : auction.endDate),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                  {auction.status === 'upcoming' && (
                    <Clock size={24} className="text-blue-500" />
                  )}
                  {auction.status === 'active' && (
                    <Timer size={24} className="text-green-500" />
                  )}
                  {auction.status === 'ended' && (
                    auction.winnerId ? (
                      <CheckCircle size={24} className="text-green-500" />
                    ) : (
                      <XCircle size={24} className="text-red-500" />
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;