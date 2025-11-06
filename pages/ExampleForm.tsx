import React, { useState, useEffect, useCallback, useId } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { lookupOutlet, submitVisitForm } from '../services/api';
import { Outlet } from '../types';
import { useAuth } from '../hooks/useAuth';
import InlineSpinner from '../components/InlineSpinner';

interface ExampleFormProps {
    formType: 'IDS' | 'D2C';
}

const ExampleForm: React.FC<ExampleFormProps> = ({ formType }) => {
    const { user } = useAuth();
    const formId = useId();

    // Form state
    const [outletId, setOutletId] = useState('');
    const [outlet, setOutlet] = useState<Outlet | null>(null);
    const [isOutletLoading, setIsOutletLoading] = useState(false);
    const [outletError, setOutletError] = useState<string | null>(null);
    const [visitNotes, setVisitNotes] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{message: string; type: 'success' | 'error'} | null>(null);

    // Geolocation hook
    const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation();

    useEffect(() => {
        // Attempt to get location on component mount
        getLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Debounced outlet lookup
    useEffect(() => {
        if (outletId.length < 5) {
            setOutlet(null);
            setOutletError(null);
            return;
        }

        const handler = setTimeout(() => {
            setIsOutletLoading(true);
            setOutletError(null);
            lookupOutlet(outletId)
                .then(data => {
                    if (data) {
                        setOutlet(data);
                    } else {
                        setOutlet(null);
                        setOutletError('Outlet ID not found.');
                    }
                })
                .finally(() => setIsOutletLoading(false));
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [outletId]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...filesArray]);

            // FIX: Explicitly cast `file` to `Blob` to resolve a TypeScript type inference issue.
            const newPreviews = filesArray.map(file => URL.createObjectURL(file as unknown as Blob));
            setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const removePhoto = (indexToRemove: number) => {
        setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
        setPhotoPreviews(prev => {
            const newPreviews = prev.filter((_, index) => index !== indexToRemove);
            // Revoke object URL to prevent memory leaks
            URL.revokeObjectURL(prev[indexToRemove]);
            return newPreviews;
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!outlet || !location) {
            alert('Please ensure Outlet ID is valid and location is captured.');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus(null);

        // In a real app, you'd upload files to a service (like Google Drive via backend)
        // and get back URLs. Here we'll just use file names.
        const photoLinks = photos.map(p => `mock-drive-link/${p.name}`);

        const formData = {
            submittedBy: user?.name,
            userRole: user?.role,
            formType,
            outlet: {
                id: outlet.id,
                name: outlet.name,
                address: outlet.address,
            },
            location,
            visitNotes,
            photos: photoLinks,
            timestamp: new Date().toISOString(),
        };
        
        try {
            const response = await submitVisitForm(formData);
            setSubmitStatus({ message: response.message, type: 'success' });
            // Reset form
            setOutletId('');
            setOutlet(null);
            setVisitNotes('');
            setPhotos([]);
            setPhotoPreviews([]);
        } catch (error) {
            setSubmitStatus({ message: 'Failed to submit form. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">{formType} Kunjungan Form</h2>
            
            {/* Outlet Lookup Section */}
            <div>
                <label htmlFor={`${formId}-outletId`} className="block text-sm font-medium text-gray-700">Outlet ID</label>
                <input
                    id={`${formId}-outletId`}
                    type="text"
                    value={outletId}
                    onChange={(e) => setOutletId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Type Outlet ID (e.g., OUTLET001)"
                    required
                />
                {isOutletLoading && (
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <InlineSpinner />
                        <span>Mencari outlet...</span>
                    </div>
                )}
                {outletError && <p className="text-sm text-red-500 mt-1">{outletError}</p>}
                {outlet && (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="font-semibold text-gray-800">{outlet.name}</p>
                        <p className="text-sm text-gray-600">{outlet.address}</p>
                    </div>
                )}
            </div>

            {/* Additional Fields based on formType */}
            {formType === 'IDS' && (
                <div>
                    <label htmlFor={`${formId}-notes`} className="block text-sm font-medium text-gray-700">Manajemen Mitra Outlet Notes</label>
                    <textarea id={`${formId}-notes`} value={visitNotes} onChange={e => setVisitNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
                </div>
            )}
            {formType === 'D2C' && (
                <div>
                    <label htmlFor={`${formId}-notes`} className="block text-sm font-medium text-gray-700">Kerjasama/Event Notes</label>
                     <textarea id={`${formId}-notes`} value={visitNotes} onChange={e => setVisitNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"></textarea>
                </div>
            )}
            
            {/* Geolocation Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Geolocation</label>
                <div className="mt-1 flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {location ? (
                        <p className="text-sm text-green-700 flex-grow">
                            Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)} (Locked)
                        </p>
                    ) : (
                        <p className="text-sm text-yellow-700 flex-grow">
                            {geoLoading ? 'Capturing location...' : 'Waiting for location...'}
                        </p>
                    )}
                    <button type="button" onClick={getLocation} disabled={geoLoading} className="ml-4 text-sm text-red-600 hover:text-red-800 disabled:opacity-50">Refresh</button>
                </div>
                {geoError && <p className="text-sm text-red-500 mt-1">Error: {geoError.message}</p>}
            </div>

            {/* Photo Upload Section */}
            <div>
                 <label className="block text-sm font-medium text-gray-700">Upload Photos</label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor={`${formId}-file-upload`} className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                                <span>Upload files</span>
                                <input id={`${formId}-file-upload`} name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoChange} />
                            </label>
                            <p className="pl-1">or take a photo</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
                {photoPreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {photoPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img src={preview} alt={`preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                                <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submission */}
            <div className="pt-5">
                {submitStatus && (
                     <div className={`p-3 rounded-md mb-4 text-sm ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {submitStatus.message}
                     </div>
                 )}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !outlet || !location}
                        className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Visit'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ExampleForm;