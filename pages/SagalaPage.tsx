
import React from 'react';

const SagalaPage: React.FC = () => {
    // IMPORTANT: Replace this with your actual Google Looker Studio embed URL
    const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/fe7230d7-5028-4682-bc15-b99859ceb2aa/page/l5YVF";

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sagala (Looker Studio)</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={lookerStudioUrl}
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                    title="Sagala Dashboard"
                ></iframe>
            </div>
        </div>
    );
};

export default SagalaPage;
