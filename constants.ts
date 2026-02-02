
import { Stream, UserData, Course, College, Scholarship } from './types';

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

export const COURSES_DATA: Record<string, Course> = {
  "Software Engineering": {
    name: "B.E./B.Tech in Computer Science & Engineering",
    overview: "A comprehensive undergraduate program focusing on computer systems, software development, and algorithmic foundations.",
    duration: "4 Years",
    eligibility: "12th Pass with PCM, minimum 50-60% marks.",
    jobRoles: ["Software Developer", "System Architect", "Full Stack Engineer", "DevOps Engineer"],
    riskLevel: "Low"
  },
  "Medicine (MBBS)": {
    name: "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
    overview: "The standard professional degree for becoming a doctor, covering various aspects of human anatomy, physiology, and clinical practice.",
    duration: "5.5 Years (including internship)",
    eligibility: "12th Pass with PCB, qualification in NEET exam.",
    jobRoles: ["General Physician", "Specialist Doctor", "Medical Officer", "Research Scientist"],
    riskLevel: "Medium"
  },
  "Chartered Accountancy": {
    name: "Chartered Accountancy (CA)",
    overview: "A professional qualification in accounting, auditing, and taxation regulated by ICAI.",
    duration: "4.5 to 5 Years",
    eligibility: "Registration after 12th (any stream), Foundation exam.",
    jobRoles: ["Auditor", "Tax Consultant", "Financial Analyst", "CFO"],
    riskLevel: "Low"
  },
  "Law (B.A. LL.B.)": {
    name: "Integrated B.A. LL.B. Honors",
    overview: "A combined degree course that provides an integrated study of humanities and law.",
    duration: "5 Years",
    eligibility: "12th Pass (any stream), CLAT or AILET entrance scores.",
    jobRoles: ["Corporate Lawyer", "Litigation Lawyer", "Legal Advisor", "Judiciary"],
    riskLevel: "Low"
  }
};

export const COLLEGES_DATA: College[] = [
  { name: "IIT Madras", location: "Chennai", state: "Tamil Nadu", district: "Chennai", type: "Government", reputation: "Tier 1 / NIRF #1", courseOffered: "Engineering" },
  { name: "IIT Bombay", location: "Mumbai", state: "Maharashtra", district: "Mumbai", type: "Government", reputation: "Tier 1 / Top Global Rank", courseOffered: "Engineering" },
  { name: "AIIMS Delhi", location: "New Delhi", state: "Delhi", district: "New Delhi", type: "Government", reputation: "Premier Medical Institute", courseOffered: "Medicine (MBBS)" },
  { name: "SRM University", location: "Chennai", state: "Tamil Nadu", district: "Chennai", type: "Private", reputation: "A++ Grade", courseOffered: "Engineering" },
  { name: "Christian Medical College (CMC)", location: "Vellore", state: "Tamil Nadu", type: "Private", reputation: "Top Private Medical", courseOffered: "Medicine (MBBS)" },
  { name: "National Law School (NLSIU)", location: "Bengaluru", state: "Karnataka", district: "Bengaluru", type: "Government", reputation: "Top Law School", courseOffered: "Law" },
  { name: "SRCC", location: "Delhi", state: "Delhi", district: "New Delhi", type: "Government", reputation: "Top Commerce College", courseOffered: "Chartered Accountancy" }
];

export const SCHOLARSHIPS_DATA: Scholarship[] = [
  {
    name: "Central Sector Scheme of Scholarship",
    provider: "Ministry of Education (Govt of India)",
    amount: "₹10,000 - ₹20,000 per annum",
    eligibleCourses: ["Engineering", "Medicine (MBBS)", "B.Com", "Arts"],
    minMarks: 80,
    incomeLimit: 800000,
    category: ["General", "OBC", "SC", "ST"],
    level: "National",
    applicationMode: "Online"
  },
  {
    name: "INSPIRE Scholarship",
    provider: "Department of Science and Technology",
    amount: "₹80,000 per annum",
    eligibleCourses: ["Science", "Research"],
    minMarks: 90,
    category: ["General", "OBC", "SC", "ST"],
    level: "National",
    applicationMode: "Online"
  },
  {
    name: "Tamil Nadu State Post-Matric Scholarship",
    provider: "TN State Government",
    amount: "Varies (Covers tuition & fees)",
    eligibleCourses: ["Engineering", "Medicine (MBBS)", "Arts", "Commerce"],
    minMarks: 35,
    incomeLimit: 250000,
    category: ["SC", "ST", "Minority"],
    level: "State",
    applicationMode: "Online"
  },
  {
    name: "Pragati Scholarship for Girls",
    provider: "AICTE",
    amount: "₹50,000 per annum",
    eligibleCourses: ["Engineering"],
    minMarks: 50,
    category: ["General", "OBC", "SC", "ST"],
    gender: "Female",
    level: "National",
    applicationMode: "Online"
  }
];

export const DEFAULT_USER_DATA: UserData = {
  academics: {
    board: '',
    stream: '',
    group: '',
    subjects: [],
    marks: 0,
    passed: false,
    category: 'General',
    gender: 'Male',
    familyIncome: 500000
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
