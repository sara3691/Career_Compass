
import React from 'react';
import Card from '../ui/Card';
import { GlobeAlt } from '../icons/GlobeAlt';
import { CurrencyDollar } from '../icons/CurrencyDollar';

const AbroadSupportInfo: React.FC = () => {
    return (
        <Card className="bg-blue-50 border border-blue-200">
            <div className="flex items-center mb-4">
                <GlobeAlt className="w-8 h-8 text-blue-600" />
                <h3 className="ml-3 text-xl font-bold text-blue-900">Studying Abroad Information</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                    <h4 className="font-semibold text-blue-800 flex items-center"><CurrencyDollar className="w-5 h-5 mr-2" />Government Support</h4>
                    <p className="mt-1 text-blue-700">The Government of India and various state governments offer education loans through nationalized banks at competitive interest rates to support students pursuing education abroad. Many schemes cover tuition fees, living expenses, and travel costs.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-blue-800">Scholarships</h4>
                    <p className="mt-1 text-blue-700">Numerous scholarships are available from both Indian and foreign governments, universities, and private trusts. Amounts can range from partial tuition waivers ($2,000 - $10,000) to fully-funded programs covering all expenses.</p>
                </div>
                <div className="md:col-span-2">
                     <h4 className="font-semibold text-blue-800">Country-wise Support Level (General)</h4>
                     <div className="mt-2 flex flex-wrap gap-4">
                        <span className="font-semibold">High Support (USA, UK, Canada, Germany): <span className="font-normal">Many scholarships, part-time work options.</span></span>
                        <span className="font-semibold">Medium Support (Australia, New Zealand): <span className="font-normal">Good opportunities, higher living costs.</span></span>
                        <span className="font-semibold">Low Support (Many European/Asian nations): <span className="font-normal">Fewer English programs and scholarships.</span></span>
                     </div>
                     <p className="text-xs text-blue-600 mt-3">*This is a general guide. Support varies greatly by university and course. Always research specific programs.</p>
                </div>
            </div>
        </Card>
    )
};

export default AbroadSupportInfo;
