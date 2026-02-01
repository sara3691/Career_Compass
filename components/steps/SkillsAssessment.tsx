
import React from 'react';
import { Skills } from '../../types';
import { SKILLS_LIST } from '../../constants';
import Card from '../ui/Card';

interface SkillsAssessmentProps {
  data: Skills;
  onUpdate: (data: Skills) => void;
}

const SkillsAssessment: React.FC<SkillsAssessmentProps> = ({ data, onUpdate }) => {
  const handleChange = (skill: keyof Skills) => {
    onUpdate({ ...data, [skill]: !data[skill] });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-2">Skills & Strength Assessment</h2>
      <p className="text-slate-600 mb-6">Select the skills you feel are your strengths. This helps in personalizing your recommendations.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SKILLS_LIST.map(skill => (
          <label 
            key={skill.id} 
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${data[skill.id] ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500' : 'bg-white border-slate-300'}`}
          >
            <input 
              type="checkbox"
              checked={data[skill.id]}
              onChange={() => handleChange(skill.id)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-3 text-sm font-medium text-slate-700">{skill.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
};

export default SkillsAssessment;
