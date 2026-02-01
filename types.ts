
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
    duration: string;
    description: string;
}

export interface College {
    name: string;
    location: string;
    courseOffered: string;
    fees: string;
    eligibility: string;
}

export interface Scholarship {
    name: string;
    provider: string;
    eligibility: string;
    amount: string;
}

export interface CareerDetails {
  whyThisCareerSuitsYou: string;
  courses: Course[];
  entranceExams: string[];
  colleges: College[];
  scholarships: Scholarship[];
  careerRoadmap: string[];
  scopeAndGrowth: string;
}

export interface AppState {
  view: View;
  step: number;
  userData: UserData;
  results: CareerRecommendation[];
  isLoading: boolean;
  error: string | null;
}
