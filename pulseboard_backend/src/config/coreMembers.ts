interface CoreMemberConfig {
  email: string;
  clubId: string;
  clubName: string;
  clubColor: string;
  clubIcon: string;
  role: "core" | "admin" | "moderator";
}

// List all core members here
export const CORE_MEMBERS: CoreMemberConfig[] = [
  {
    email: "arjun@iitj.ac.in",
    clubId: "devlups_123",
    clubName: "Devlups",
    clubColor: "#3B82F6",
    clubIcon: "💻",
    role: "core"
  },
  {
    email: "priya@iitj.ac.in",
    clubId: "design_456",
    clubName: "Design Club",
    clubColor: "#EC4899",
    clubIcon: "🎨",
    role: "core"
  },
  // Add your email here to test
  // {
  //   email: "your-email@example.com",
  //   clubId: "devlups_123",
  //   clubName: "Devlups",
  //   clubColor: "#3B82F6",
  //   clubIcon: "💻",
  //   role: "core"
  // },
];

// Helper function to check if user is core member
export const getCoreMembershipByEmail = (email: string): CoreMemberConfig | null => {
  const coreMember = CORE_MEMBERS.find(
    (member) => member.email.toLowerCase() === email.toLowerCase()
  );
  return coreMember || null;
};

// Helper function to check if email is a core member
export const isCoreMemberEmail = (email: string): boolean => {
  return CORE_MEMBERS.some(
    (member) => member.email.toLowerCase() === email.toLowerCase()
  );
};