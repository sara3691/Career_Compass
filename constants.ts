
import { Stream, UserData } from './types';

export const EDUCATION_BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];

export const STREAMS = Object.values(Stream);

export const STREAM_SUBJECTS: Record<Stream, Record<string, string[]>> = {
  [Stream.Science]: {
    'PCM (Physics, Chemistry, Maths)': ['Physics', 'Chemistry', 'Maths', 'English'],
    'PCB (Physics, Chemistry, Biology)': ['Physics', 'Chemistry', 'Biology', 'English'],
    'PCMB (Physics, Chemistry, Maths, Biology)': ['Physics', 'Chemistry', 'Maths', 'Biology', 'English'],
  },
  [Stream.Commerce]: {
    'With Maths': ['Accountancy', 'Business Studies', 'Economics', 'English', 'Maths'],
    'Without Maths': ['Accountancy', 'Business Studies', 'Economics', 'English', 'Informatics Practices'],
  },
  [Stream.Arts]: {
    'Humanities': ['History', 'Political Science', 'Sociology', 'English', 'Economics'],
    'Fine Arts': ['History', 'English', 'Fine Arts', 'Psychology', 'Geography'],
  },
  [Stream.Vocational]: {
    'IT & Computer Science': ['Computer Science', 'IT', 'English', 'Maths'],
    'Agriculture': ['Agriculture', 'Biology', 'Chemistry', 'English'],
  },
};

export const SKILLS_LIST = [
  { id: 'communication', label: 'Communication' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'logicalThinking', label: 'Logical Thinking' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'analytical', label: 'Analytical Skills' },
  { id: 'practical', label: 'Practical / Field Skills' },
] as const;


export const STREAM_INTERESTS: Record<Stream, string[]> = {
    [Stream.Science]: ['Engineering', 'Medical', 'Research', 'Data Science', 'Architecture', 'Aviation'],
    [Stream.Commerce]: ['Finance', 'Accounting', 'Marketing', 'Management', 'Banking', 'Entrepreneurship'],
    [Stream.Arts]: ['Journalism', 'Law', 'Civil Services', 'Design', 'Psychology', 'Teaching'],
    [Stream.Vocational]: ['Software Development', 'Agriculture Science', 'Tourism', 'Fashion Designing'],
};


export const INDIAN_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru"],
  "Delhi": ["New Delhi"],
};

export const DEFAULT_USER_DATA: UserData = {
  academics: {
    board: '',
    stream: '',
    group: '',
    subjects: [],
    marks: 0,
    passed: false,
  },
  skills: {
    communication: false,
    creativity: false,
    logicalThinking: false,
    leadership: false,
    analytical: false,
    practical: false,
  },
  interests: {
    primary: '',
    other: '',
  },
  location: {
    state: '',
    districts: [],
    anywhereInIndia: false,
    abroad: false,
  },
};
