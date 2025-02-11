import dotenv from 'dotenv';

dotenv.config();

interface PortkeyUser {
  object: string;
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  created_at: string;
  last_updated_at: string;
}

interface PortkeyUsersResponse {
  total: number;
  object: string;
  data: PortkeyUser[];
}

export class PortkeyService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.portkey.ai/v1';

  constructor() {
    const apiKey = process.env.PORTKEY_API_KEY;
    if (!apiKey) {
      throw new Error('PORTKEY_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  async listUsers(): Promise<PortkeyUsersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PortkeyUsersResponse;
      return {
        total: data.total,
        object: data.object,
        data: data.data.map(user => ({
          object: user.object,
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          last_updated_at: user.last_updated_at
        }))
      };
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch users from Portkey API');
    }
  }
} 