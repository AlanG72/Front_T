import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard, Plus, Star, History, Trash2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  isDefault: boolean;
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  // Redirect if user is not a bidder
  if (!user || user.userType !== 'bidder') {
    return <Navigate to="/" replace />;
  }

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add payment method');
      
      await fetchPaymentMethods();
      setIsModalOpen(false);
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      });
    } catch (err) {
      setError('Failed to add payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${id}/default`, {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('Failed to set default payment method');
      
      await fetchPaymentMethods();
    } catch (err) {
      setError('Failed to set default payment method');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete payment method');
      
      await fetchPaymentMethods();
    } catch (err) {
      setError('Failed to delete payment method');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <div className="flex gap-3">
            <Link to="/payment-history">
              <Button variant="outline" icon={<History size={20} />}>
                Payment History
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus size={20} />}
            >
              Add Payment Method
            </Button>
          </div>
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Your Cards</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payment methods added yet
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      method.isDefault ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow">
                        <CreditCard size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            •••• {method.cardNumber.slice(-4)}
                          </span>
                          {method.isDefault && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method.cardholderName} • Expires {method.expiryDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          icon={<Star size={16} />}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(method.id)}
                        icon={<Trash2 size={16} />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Add Payment Method Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Add Payment Method
                </h2>
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Cardholder Name"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Card Number"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    required
                    fullWidth
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                    />
                    <Input
                      label="CVV"
                      name="cvv"
                      type="password"
                      maxLength={4}
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
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
                      icon={<CreditCard size={20} />}
                    >
                      Add Card
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

export default Payments;