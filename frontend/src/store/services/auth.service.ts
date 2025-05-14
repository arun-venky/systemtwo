import api from '../../utils/api';

export const authService = {
  async login(email: string, password: string) {    
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async signup(username: string, email: string, password: string) {    
    const response =  await api.post('/auth/signup', { username, email, password })
    .then(response => response.data)
    .catch(error => {
      console.error('Auth Error: Signup failed', error)
      throw error
    })
    return response.data;
  },

  async verifyAuth(token: string) {
    // Verify token with backend
    try {
      const response = await api.post('/auth/verify', { token });
      if (response.data.valid) {
        // Update user data if needed
        if (response.data.user) {
          // this.user = response.data.user;
          // this.permissions = response.data.user.permissions || [];
          // this.roles = response.data.user.roles || [];
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return true;
      } else {
        //this.logout();
        return false;
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
      //this.logout();
      return false;
    }
  },

  async getRefreshToken() {
    try {
      await api.post('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: ''//this.refreshToken
        })
      });

      // if (!response.ok) {
      //   throw new Error('Failed to refresh token');
      // }

      // const data = await response.json();
      // this.token = data.token;
      // this.refreshToken = data.refreshToken;

      // localStorage.setItem('token', data.token);
      // localStorage.setItem('refreshToken', data.refreshToken);

      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.logout();
      return false;
    }
  },
}; 