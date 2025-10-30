
import React from 'react';

const VideoPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Video Roleplay</h1>
            <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Submit Your Roleplay</h2>
                <p className="text-gray-700">This page will contain a form for submitting roleplay videos. The form will include fields for a title, description, and a video file upload.</p>
            </div>
        </div>
    );
};

export default VideoPage;
