import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <svg
              className="h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
            <p className="text-xl text-gray-600 mb-1">Page Not Found</p>
            <p className="text-gray-500">
              The page you're looking for doesn't exist.
            </p>
          </div>

          <Button
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
