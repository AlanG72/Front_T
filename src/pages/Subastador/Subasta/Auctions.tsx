import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { Gavel, Plus, Edit2, Timer, DollarSign, Users } from 'lucide-react';

interface Auction {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  startPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  bidCount: number;
}

const Auctions: React.FC = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    startPrice: '',
    startDate: '',
    endDate: '',
  });

  const fetchAuctions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) throw new Error('Failed to fetch auctions');
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError('Failed to load auctions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedAuction ? 'PUT' : 'POST';
      const url = selectedAuction 
        ? `/api/auctions/${selectedAuction.id}` 
        : '/api/auctions';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save auction');
      
      await fetchAuctions();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to save auction');
    }
  };

  const handleBid = async (auctionId: string) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to place bid');
      
      await fetchAuctions();
    } catch (err) {
      setError('Failed to place bid');
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      startPrice: '',
      startDate: '',
      endDate: '',
    });
    setSelectedAuction(null);
  };

  const openEditModal = (auction: Auction) => {
    setSelectedAuction(auction);
    setFormData({
      productId: auction.productId,
      startPrice: auction.startPrice.toString(),
      startDate: new Date(auction.startDate).toISOString().split('T')[0],
      endDate: new Date(auction.endDate).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Auction['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>
          {user?.userType === 'auctioneer' && (
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              icon={<Plus size={20} />}
            >
              Create Auction
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {auctions.map((auction) => (
            <Card key={auction.id} className="animate-slide-up">
              <CardBody>
                <div className="flex gap-6">
                  <div className="w-48 h-48 flex-shrink-0">
                    <img
                      src={auction.productImage}
                      alt={auction.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {auction.productName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(auction.status)}`}>
                          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                        </span>
                      </div>
                      {user?.userType === 'auctioneer' && auction.status === 'upcoming' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(auction)}
                          icon={<Edit2 size={16} />}
                        >
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Current Price</div>
                        <div className="text-lg font-semibold text-primary-600 flex items-center gap-1">
                          <DollarSign size={16} />
                          {auction.currentPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Time Remaining</div>
                        <div className="text-lg font-medium flex items-center gap-1">
                          <Timer size={16} className="text-gray-400" />
                          {/* Add actual time calculation logic */}
                          2d 4h
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Bids</div>
                        <div className="text-lg font-medium flex items-center gap-1">
                          <Users size={16} className="text-gray-400" />
                          {auction.bidCount}
                        </div>
                      </div>
                    </div>

                    {user?.userType === 'bidder' && auction.status === 'active' && (
                      <div className="mt-6">
                        <Button
                          variant="primary"
                          onClick={() => handleBid(auction.id)}
                          icon={<Gavel size={20} />}
                        >
                          Place Bid
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Create/Edit Auction Modal */}
        {isModalOpen && user?.userType === 'auctioneer' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedAuction ? 'Edit Auction' : 'Create New Auction'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Product"
                    name="productId"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Starting Price ($)"
                    type="number"
                    name="startPrice"
                    value={formData.startPrice}
                    onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                    required
                    fullWidth
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                    <Input
                      label="End Date"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={selectedAuction ? <Edit2 size={20} /> : <Plus size={20} />}
                    >
                      {selectedAuction ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;