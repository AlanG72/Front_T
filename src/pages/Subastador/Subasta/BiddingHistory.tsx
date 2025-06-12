import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const BiddingHistory: React.FC = () => {
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">BiddingHistory</h1>
        </div>


        <Card className="animate-slide-up delay-75">
          <CardBody>
            {(
              <div className="flex justify-center items-center py-8">
              Agregar
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default BiddingHistory;