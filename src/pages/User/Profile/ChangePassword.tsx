import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardBody, CardFooter } from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas de contraseñas
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Usuarios/cambiar-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId: user?.id, // Se obtiene del contexto (asegúrate de tenerlo)
          passwordActual: formData.currentPassword,
          nuevoPassword: formData.newPassword,
          confirmarPassword: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        // Redirige al perfil si la contraseña se actualizó exitosamente y pasa un mensaje
        navigate('/profile', { state: { message: 'Password successfully updated' } });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error al cambiar la contraseña:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="mt-2 text-gray-600">Update your account password</p>
        </div>

        <Card className="animate-slide-up">
          <form onSubmit={handleSubmit}>
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
              />
            </CardBody>
            <CardFooter>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                icon={<Lock size={20} />}
              >
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;