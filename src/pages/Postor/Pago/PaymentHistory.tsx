import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { CreditCard, Filter, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  cardLastFour: string;
  date: string;
  status: 'successful' | 'failed' | 'pending';
  description: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
      }).toString();

      const response = await fetch(`/api/payments/history?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch payment history');
      
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment History</h1>

        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-primary-600" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                name="startDate"
                label="Start Date"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
              <Input
                type="date"
                name="endDate"
                label="End Date"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-75">
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payments found for the selected filters
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary-50 p-2 rounded-lg">
                        <CreditCard size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.description}
                        </div>
                        <div className="text-sm text-gray-600">
                          Card ending in {payment.cardLastFour} • {new Date(payment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <DollarSign size={16} />
                          {payment.amount.toFixed(2)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PaymentHistory;