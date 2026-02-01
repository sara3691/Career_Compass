
import React from 'react';
import { UserData } from '../../types';
import Card from '../ui/Card';

interface UserSummaryProps {
  userData: UserData;
}

const SummaryItem: React.FC<{ label: string, value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 font-semibold">{value}</dd>
    </div>
);


const UserSummary: React.FC<UserSummaryProps> = ({ userData }) => {
    const skills = Object.entries(userData.skills)
        .filter(([, value]) => value)
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        .join(', ');

    const location = [
        userData.location.state,
        ...userData.location.districts,
        userData.location.anywhereInIndia ? 'Anywhere in India' : '',
        userData.location.abroad ? 'Abroad' : ''
    ].filter(Boolean).join(', ');

    return (
        <Card>
            <h3 className="text-lg font-bold">Your Profile Summary</h3>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                <SummaryItem label="Stream" value={userData.academics.stream} />
                <SummaryItem label="Marks" value={`${userData.academics.marks}%`} />
                <SummaryItem label="Subjects" value={userData.academics.subjects.join(', ')} />
                <SummaryItem label="Primary Interest" value={userData.interests.primary} />
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <SummaryItem label="Skills" value={skills || 'None selected'} />
                </div>
                 <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <SummaryItem label="Location Preference" value={location || 'None specified'} />
                </div>
            </dl>
        </Card>
    );
};

export default UserSummary;
