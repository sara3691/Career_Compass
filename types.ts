
export enum Stream {
  Science = 'Science',
  Commerce = 'Commerce',
  Arts = 'Arts',
  Vocational = 'Vocational',
}

export enum View {
    Homepage,
    AcademicDetails,
    SkillsAssessment,
    InterestSelection,
    LocationPreference,
    Submit,
    Results,
}

export interface AcademicDetails {
  board: string;
  stream: Stream | '';
  group: string;
  subjects: string[];
  marks: number;
  passed: boolean;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'Minority';
  gender?: 'Male' | 'Female' | 'Other';
  familyIncome?: number;
}

export interface Skills {
  communication: boolean;
  creativity: boolean;
  logicalThinking: boolean;
  leadership: boolean;
  analytical: boolean;
  practical: boolean;
}

export interface Interests {
  primary: string;
  other: string;
}

export interface LocationPreference {
  state: string;
  districts: string[];
  anywhereInIndia: boolean;
  abroad: boolean;
}

export interface UserData {
  academics: AcademicDetails;
  skills: Skills;
  interests: Interests;
  location: LocationPreference;
}

export interface CareerRecommendation {
  careerName: string;
  matchPercentage: number;
  eligibilityStatus: 'Eligible' | 'Not Eligible';
  riskLevel: 'Low' | 'Medium' | 'High';
  shortDescription: string;
  whyItMatches: string;
  parentalAdvice: string;
}

export interface Course {
    name: string;
    overview: string;
    duration: string;
    eligibility: string;
    jobRoles: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
}

/**
 * Added College interface to fix missing export error in constants.ts
 */
export interface College {
  name: string;
  location: string;
  state: string;
  district?: string;
  type: string;
  reputation: string;
  courseOffered: string;
}

/**
 * Added Scholarship interface to fix missing export error in constants.ts
 */
export interface Scholarship {
  name: string;
  provider: string;
  amount: string;
  eligibleCourses: string[];
  minMarks: number;
  incomeLimit?: number;
  category: string[];
  level: string;
  applicationMode: string;
  gender?: string;
}

export interface CareerDetails {
  whyThisCareerSuitsYou: string;
  careerRoadmap: string[];
  scopeAndGrowth: string;
  suggestedColleges: {
    name: string;
    location: string;
    type: string;
    reasoning: string;
  }[];
  suggestedScholarships: {
    name: string;
    provider: string;
    typicalEligibility: string;
  }[];
}

export interface AppState {
  view: View;
  step: number;
  userData: UserData;
  results: CareerRecommendation[];
  isLoading: boolean;
  error: string | null;
}
