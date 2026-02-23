import api from './client';

export const getUserProfile = async () => {
  try {
<<<<<<< HEAD
    // Uses the shared client with the Token logic automatically included
    const response = await api.get('/api/users/me'); 
    
    // Return user data with core member fields
    return {
      ...response.data,
      // ADD THESE FIELDS from backend response
      isCoreMember: response.data.isCoreMember || false,
      coreMembership: response.data.coreMembership || null
      // coreMembership structure expected:
      // {
      //   clubId: string,
      //   clubName: string,
      //   clubColor: string,
      //   clubIcon: string,
      //   role: 'core' | 'admin' | 'moderator'
      // }
    };
=======
    const response = await api.get('/users/me');
    return response.data;
>>>>>>> 4361ecec98dc87ee9b6b7467257728032cecf089
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};