
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</p>
            <p className="text-gray-600 mt-2">Sorry, the page you are looking for does not exist.</p>
            <Link to="/dashboard" className="mt-6 inline-block bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors">
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
