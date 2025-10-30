
import React from 'react';

interface PlaceholderPageProps {
    title: string;
    description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Content Under Development</h2>
                <p className="text-gray-700">
                    {description || `The content for the "${title}" page is currently being developed and will be available soon.`}
                </p>
            </div>
        </div>
    );
};

export default PlaceholderPage;
