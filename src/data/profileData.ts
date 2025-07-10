export type Card = {
  id: number;
  name: string;
  profileImage: string;
  course: string;
  university: string;
  skills: string[];
  interests: string[];
  age: number;
};

export const profileData: Card[] = [
  {
    id: 1,
    name: "Sarah Chen",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b332c5e2?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Computer Science",
    university: "MIT",
    age: 22,
    skills: ["React", "Python", "Machine Learning", "Data Analysis"],
    interests: ["Photography", "Hiking", "Tech Startups", "Coffee"]
  },
  {
    id: 2,
    name: "Marcus Johnson",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
    course: "BA Business Administration",
    university: "Stanford University",
    age: 24,
    skills: ["Marketing", "Finance", "Leadership", "Strategy"],
    interests: ["Basketball", "Entrepreneurship", "Travel", "Cooking"]
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
    course: "BA Graphic Design",
    university: "UCLA",
    age: 21,
    skills: ["Photoshop", "Illustrator", "UI/UX", "Branding"],
    interests: ["Art", "Music", "Fashion", "Yoga"]
  },
  {
    id: 4,
    name: "James Wilson",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Mechanical Engineering",
    university: "Georgia Tech",
    age: 23,
    skills: ["CAD", "3D Modeling", "Robotics", "Project Management"],
    interests: ["Gaming", "Cars", "Technology", "Fitness"]
  },
  {
    id: 5,
    name: "Sophia Kim",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Psychology",
    university: "Harvard University",
    age: 20,
    skills: ["Research", "Statistics", "Counseling", "Writing"],
    interests: ["Reading", "Meditation", "Volunteering", "Theater"]
  },
  {
    id: 6,
    name: "David Brown",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Finance",
    university: "NYU Stern",
    age: 22,
    skills: ["Financial Analysis", "Excel", "Bloomberg", "Risk Management"],
    interests: ["Stock Trading", "Soccer", "Traveling", "Food"]
  },
  {
    id: 7,
    name: "Olivia Davis",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Environmental Science",
    university: "UC Berkeley",
    age: 21,
    skills: ["Research", "GIS", "Environmental Law", "Public Speaking"],
    interests: ["Sustainability", "Camping", "Photography", "Activism"]
  },
  {
    id: 8,
    name: "Alex Thompson",
    profileImage: "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=400&auto=format&fit=crop",
    course: "BSc. Computer Engineering",
    university: "Carnegie Mellon",
    age: 23,
    skills: ["Hardware Design", "Software Development", "AI", "Embedded Systems"],
    interests: ["Skateboarding", "Music Production", "Startups", "Gaming"]
  }
];
