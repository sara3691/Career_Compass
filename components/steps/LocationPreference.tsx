
import React, { useState, useEffect } from 'react';
import { LocationPreference as LocationPreferenceType } from '../../types';
import { INDIAN_STATES } from '../../constants';
import Card from '../ui/Card';

interface LocationPreferenceProps {
  data: LocationPreferenceType;
  onUpdate: (data: LocationPreferenceType) => void;
}

const LocationPreference: React.FC<LocationPreferenceProps> = ({ data, onUpdate }) => {
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        onUpdate(localData);
    }, [localData, onUpdate]);

    const handleStateChange = (state: string) => {
        setLocalData(prev => ({ ...prev, state, districts: [] }));
    };

    const handleDistrictChange = (district: string) => {
        setLocalData(prev => {
            const newDistricts = prev.districts.includes(district)
                ? prev.districts.filter(d => d !== district)
                : [...prev.districts, district];
            return { ...prev, districts: newDistricts };
        });
    };
    
    const handleCheckboxChange = (field: 'anywhereInIndia' | 'abroad') => {
        setLocalData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const districtOptions = localData.state ? INDIAN_STATES[localData.state] : [];

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-2">Location Preference</h2>
            <p className="text-slate-600 mb-6">Where would you like to study? This will help us suggest relevant colleges, courses, and scholarships.</p>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">State</label>
                    <select
                        value={localData.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a state</option>
                        {Object.keys(INDIAN_STATES).map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                </div>
                {localData.state && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700">District (Optional, select one or more)</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {districtOptions.map(district => (
                                <label key={district} className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${localData.districts.includes(district) ? 'bg-indigo-100 border-indigo-400' : 'bg-white'}`}>
                                    <input
                                        type="checkbox"
                                        checked={localData.districts.includes(district)}
                                        onChange={() => handleDistrictChange(district)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">{district}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0 pt-4 border-t border-slate-200">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={localData.anywhereInIndia}
                            onChange={() => handleCheckboxChange('anywhereInIndia')}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-700">Anywhere in India</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={localData.abroad}
                            onChange={() => handleCheckboxChange('abroad')}
                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-sm font-medium text-slate-700">Study Abroad</span>
                    </label>
                </div>
            </div>
        </Card>
    );
};

export default LocationPreference;
