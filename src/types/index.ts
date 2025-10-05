export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  type: 'Government' | 'Private' | 'Deemed';
  rating: number;
  image: string;
  branches: Branch[];
  infrastructure: Infrastructure;
  placements: Placement;
  facilities: string[];
  established: number;
  affiliation: string;
  nirf_ranking?: number;
}

export interface Branch {
  name: string;
  category: 'Engineering' | 'Medical' | 'Commerce' | 'Arts' | 'Science' | 'Management';
  fees: {
    annual: number;
    total: number;
  };
  seats: number;
  cutoff?: number;
}

export interface Infrastructure {
  campus_area: string;
  hostels: {
    boys: boolean;
    girls: boolean;
    capacity: number;
  };
  library: boolean;
  labs: number;
  sports_facilities: string[];
  auditorium: boolean;
  medical_facility: boolean;
}

export interface Placement {
  percentage: number;
  average_package: number;
  highest_package: number;
  top_recruiters: string[];
}

export interface PG {
  id: string;
  name: string;
  type: 'PG' | 'Hostel' | 'Apartment';
  location: string;
  rent: number;
  security_deposit: number;
  gender: 'Boys' | 'Girls' | 'Co-ed';
  food_type: string[];
  amenities: string[];
  images: string[];
  distance_from_colleges: { college_name: string; distance: string }[];
  contact: {
    phone: string;
    email: string;
  };
  rating: number;
  available_rooms: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

export interface SearchFilters {
  location?: string;
  branch?: string;
  college_type?: string;
  fee_range?: {
    min: number;
    max: number;
  };
  rating_min?: number;
}

export interface PGFilters {
  location?: string;
  rent_range?: {
    min: number;
    max: number;
  };
  gender?: string;
  food_type?: string;
  amenities?: string[];
}

// UserProfile now includes a favorites object
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  interests?: string[];
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  loginCount: number;
  isActive: boolean;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    darkMode: boolean;
    language: string;
  };
  favorites: {
    colleges: string[]; // Array of college IDs
    pgs: string[];     // Array of PG IDs
  };
}