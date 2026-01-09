const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3046';

export const getUser = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/${email}`, {
      method: 'GET',
      credentials: 'include', // Send cookies for authentication
      headers: {
        'Accept': 'application/json',
      },
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch user: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.user; // Return the user object
    } else {
      throw new Error(data.error || 'Failed to get user data');
    }
    
  } catch (error) {
    console.error('getUser error:', error);
    throw error;
  }
};