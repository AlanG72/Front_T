import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  initialPrice: number;
  imageUrl: string;
  status: 'available' | 'auctioned';
  createdAt: string;
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialPrice: '',
    imageUrl: '',
  });

  // Redirect if user is not an auctioneer
  if (!user || user.userType !== 'auctioneer') {
    return <Navigate to="/\" replace />;
  }

const token = localStorage.getItem('user_token');
console.log("🧪 Token a enviar:", token);

const fetchProducts = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('user_token'); // Obtener token con permisos
    const response = await fetch('http://localhost:5175/api/productos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al obtener los productos');

    const data = await response.json();

    const mappedProducts: Product[] = data.map((product: any) => ({
      id: product.id,
      name: product.nombre.valor,
      description: product.categoria.valor,
      initialPrice: product.precioBase.valor,
      imageUrl: product.imagenUrl.valor,
      status: product.estado.valor === "Disponible" ? "available" : "auctioned",
      createdAt: new Date().toISOString()
    }));

    setProducts(mappedProducts);
  } catch (err) {
    setError('Error al cargar los productos');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);


  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedProduct ? 'PUT' : 'POST';
      const url = selectedProduct 
        ? `/api/products/${selectedProduct.id}` 
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          initialPrice: parseFloat(formData.initialPrice),
          imageUrl: formData.imageUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to save product');
      
      await fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      await fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      initialPrice: '',
      imageUrl: '',
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      initialPrice: product.initialPrice.toString(),
      imageUrl: product.imageUrl,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            icon={<Plus size={20} />}
          >
            Add Product
          </Button>
        </div>

        {/* Available Products */}
        <Card className="mb-8 animate-slide-up">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Available Products</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-6">
              {products
                .filter(product => product.status === 'available')
                .map(product => (
                  <div key={product.id} className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="w-48 h-48 flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-gray-600 mt-1">{product.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(product)}
                            icon={<Edit2 size={16} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(product.id)}
                            icon={<Trash2 size={16} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-primary-600 font-semibold">
                          Initial Price: ${product.initialPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>

        {/* Auctioned Products */}
        <Card className="animate-slide-up delay-75">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Auctioned Products</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-6">
              {products
                .filter(product => product.status === 'auctioned')
                .map(product => (
                  <div key={product.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="w-48 h-48 flex-shrink-0">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg opacity-75"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                      <p className="text-gray-500 mt-1">{product.description}</p>
                      <div className="mt-4">
                        <span className="text-gray-600 font-semibold">
                          Initial Price: ${product.initialPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Auctioned
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardBody>
        </Card>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Initial Price ($)"
                    type="number"
                    name="initialPrice"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Image URL"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                    fullWidth
                  />
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
                      icon={selectedProduct ? <Edit2 size={20} /> : <Plus size={20} />}
                    >
                      {selectedProduct ? 'Update' : 'Create'}
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

export default Products;