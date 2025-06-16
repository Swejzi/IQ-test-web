import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-bold text-neutral-900 mt-4">
            Stránka nenalezena
          </h2>
          <p className="text-neutral-600 mt-2">
            Omlouváme se, ale stránka kterou hledáte neexistuje.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Zpět
          </button>
          <Link
            to="/"
            className="btn btn-primary flex items-center justify-center"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Domovská stránka
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
