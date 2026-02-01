
import React from 'react';
import Card from '../ui/Card';
import { BookOpen } from '../icons/BookOpen';
import { UserGroup } from '../icons/UserGroup';
import { Sparkles } from '../icons/Sparkles';
import { ArrowRight } from '../icons/ArrowRight';


interface HomepageProps {
    onStart: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onStart }) => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Find Your Future with <span className="text-indigo-600">Career Compass AI</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Making informed career decisions after +2 can be tough. We're here to provide clear, personalized, and realistic guidance based on your unique academic profile and interests.
        </p>
        <button
            onClick={onStart}
            className="mt-8 inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
            Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            <h3 className="ml-4 text-xl font-bold">Why Career Guidance Matters</h3>
          </div>
          <p className="mt-4 text-slate-600">Choosing the right path after school sets the foundation for your entire professional life. Good guidance helps prevent wrong turns, saving you time, money, and stress.</p>
        </Card>
        <Card>
          <div className="flex items-center">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <h3 className="ml-4 text-xl font-bold">What This Platform Offers</h3>
          </div>
          <p className="mt-4 text-slate-600">We use a strict, rule-based system combined with AI to analyze your academics, skills, and interests, providing career paths you are genuinely eligible for and suited to.</p>
        </Card>
        <Card>
          <div className="flex items-center">
            <UserGroup className="w-8 h-8 text-indigo-500" />
            <h3 className="ml-4 text-xl font-bold">Who Can Use This</h3>
          </div>
          <p className="mt-4 text-slate-600">This platform is designed for students completing their +2 education, as well as for parents who want to understand the options available for their children in a simple, clear format.</p>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;
