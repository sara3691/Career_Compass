
import React, { useState, useEffect } from 'react';
import { Interests, Stream } from '../../types';
import { STREAM_INTERESTS } from '../../constants';
import Card from '../ui/Card';
import { InformationCircle } from '../icons/InformationCircle';

interface InterestSelectionProps {
  stream: Stream | '';
  data: Interests;
  onUpdate: (data: Interests) => void;
}

const InterestSelection: React.FC<InterestSelectionProps> = ({ stream, data, onUpdate }) => {
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        onUpdate(localData);
    }, [localData, onUpdate]);

    const handleChange = <K extends keyof Interests>(key: K, value: Interests[K]) => {
        setLocalData(prev => ({ ...prev, [key]: value }));
    };

    const interestOptions = stream ? STREAM_INTERESTS[stream] : [];

    if (!stream) {
        return (
            <Card>
                <div className="flex items-center text-amber-700 bg-amber-100 p-4 rounded-lg">
                    <InformationCircle className="w-6 h-6 mr-3" />
                    <p>Please select your academic stream in the previous step to see relevant interests.</p>
                </div>
            </Card>
        );
    }
    
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-2">Interest Selection</h2>
            <p className="text-slate-600 mb-6">What domains are you passionate about? Your interest cannot override academic eligibility but helps us find the best fit.</p>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Primary Interest Domain</label>
                    <select
                        value={localData.primary}
                        onChange={(e) => handleChange('primary', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select an interest</option>
                        {interestOptions.map(interest => <option key={interest} value={interest}>{interest}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="other-interest" className="block text-sm font-medium text-slate-700">
                        Any Other Interest? (Optional)
                    </label>
                    <input
                        type="text"
                        id="other-interest"
                        value={localData.other}
                        onChange={(e) => handleChange('other', e.target.value)}
                        placeholder="e.g., Creative Writing, Robotics"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">Our AI will understand your intent even with spelling variations.</p>
                </div>
            </div>
        </Card>
    );
};

export default InterestSelection;
