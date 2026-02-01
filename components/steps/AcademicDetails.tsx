
import React, { useState, useEffect } from 'react';
import { AcademicDetails as AcademicDetailsType, Stream } from '../../types';
import { EDUCATION_BOARDS, STREAMS, STREAM_SUBJECTS } from '../../constants';
import Card from '../ui/Card';

interface AcademicDetailsProps {
  data: AcademicDetailsType;
  onUpdate: (data: AcademicDetailsType) => void;
}

const AcademicDetails: React.FC<AcademicDetailsProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    onUpdate(localData);
  }, [localData, onUpdate]);

  const handleChange = <K extends keyof AcademicDetailsType>(key: K, value: AcademicDetailsType[K]) => {
    setLocalData(prev => {
        let updatedData = { ...prev, [key]: value };
        if (key === 'stream') {
            updatedData = { ...updatedData, group: '', subjects: [] };
        }
        if (key === 'group') {
            const stream = updatedData.stream;
            if (stream && STREAM_SUBJECTS[stream] && STREAM_SUBJECTS[stream][value as string]) {
                updatedData.subjects = STREAM_SUBJECTS[stream][value as string];
            }
        }
        if (key === 'marks') {
            const marksValue = Number(value);
            updatedData.passed = marksValue >= 35;
        }
        return updatedData;
    });
  };

  const currentGroups = localData.stream ? Object.keys(STREAM_SUBJECTS[localData.stream]) : [];

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-2">Academic Details</h2>
      <p className="text-slate-600 mb-6">Your academic information is the most important factor for determining career eligibility.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Education Board</label>
          <select 
            value={localData.board}
            onChange={(e) => handleChange('board', e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Board</option>
            {EDUCATION_BOARDS.map(board => <option key={board} value={board}>{board}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Stream</label>
          <select 
            value={localData.stream}
            onChange={(e) => handleChange('stream', e.target.value as Stream)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Stream</option>
            {STREAMS.map(stream => <option key={stream} value={stream}>{stream}</option>)}
          </select>
        </div>
        {localData.stream && (
            <div>
                <label className="block text-sm font-medium text-slate-700">Group / Subject Combination</label>
                <select
                    value={localData.group}
                    onChange={(e) => handleChange('group', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">Select Group</option>
                    {currentGroups.map(group => <option key={group} value={group}>{group}</option>)}
                </select>
            </div>
        )}
        {localData.subjects.length > 0 && (
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Subjects</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {localData.subjects.map(subject => (
                        <span key={subject} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">{subject}</span>
                    ))}
                </div>
            </div>
        )}
        <div>
            <label className="block text-sm font-medium text-slate-700">Marks (%)</label>
            <input 
                type="number"
                min="0"
                max="100"
                value={localData.marks}
                onChange={(e) => handleChange('marks', Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700">Result Status</label>
            <div className={`mt-2 text-lg font-bold ${localData.passed ? 'text-green-600' : 'text-red-600'}`}>
                {localData.marks >= 35 ? 'Pass' : (localData.marks > 0 ? 'Fail' : 'N/A')}
            </div>
        </div>
      </div>
    </Card>
  );
};

export default AcademicDetails;
