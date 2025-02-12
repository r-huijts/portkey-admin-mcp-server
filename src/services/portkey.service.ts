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

interface WorkspaceDetails {
  id: string;    // Changed from slug to id
  role: 'admin' | 'member' | 'manager';  // Added 'manager' option
}

interface WorkspaceApiKeyDetails {
  name?: string;
  expiry?: string;
  metadata?: Record<string, string>;
  scopes: string[];  // Added required scopes array
}

interface InviteUserRequest {
  email: string;
  role: 'admin' | 'member';
  first_name?: string;
  last_name?: string;
  workspaces: WorkspaceDetails[];
  workspace_api_key_details?: WorkspaceApiKeyDetails;
}

interface InviteUserResponse {
  id: string;        // Changed to match API response
  invite_link: string;  // Changed to match API response
}

interface UserGroupedDataParams {
  time_of_generation_min: string;  // ISO8601 format
  time_of_generation_max: string;  // ISO8601 format
  total_units_min?: number;
  total_units_max?: number;
  cost_min?: number;
  cost_max?: number;
  prompt_token_min?: number;
  prompt_token_max?: number;
  completion_token_min?: number;
  completion_token_max?: number;
  status_code?: string;
  weighted_feedback_min?: number;
  weighted_feedback_max?: number;
  virtual_keys?: string;
  configs?: string;
  workspace_slug?: string;
  api_key_ids?: string;
  current_page?: number;
  page_size?: number;
  metadata?: string;
  ai_org_model?: string;
  trace_id?: string;
  span_id?: string;
}

interface AnalyticsGroup {
  user: string;
  requests: string;
  cost: string;
  object: "analytics-group";
}

interface UserGroupedData {
  total: number;
  object: string;
  data: AnalyticsGroup[];
}

interface WorkspaceDefaults {
  is_default?: number;
  metadata?: Record<string, string>;
  object: 'workspace';
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  last_updated_at: string;
  defaults: WorkspaceDefaults | null;
  object: 'workspace';
}

interface ListWorkspacesResponse {
  total: number;
  object: 'list';
  data: Workspace[];
}

interface ListWorkspacesParams {
  page_size?: number;
  current_page?: number;
}

interface WorkspaceUser {
  object: 'workspace-user';
  id: string;
  first_name: string;
  last_name: string;
  org_role: 'admin' | 'member' | 'owner';
  role: 'admin' | 'member' | 'manager';
  status: 'active';
  created_at: string;
  last_updated_at: string;
}

interface SingleWorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  last_updated_at: string;
  defaults: {
    is_default: number;
    metadata: Record<string, string>;
    object: 'workspace';
  } | null;
  users: WorkspaceUser[];
}

interface Config {
  id: string;
  name: string;
  slug: string;
  organisation_id: string;
  workspace_id: string;
  is_default: number;
  status: string;
  owner_id: string;
  updated_by: string;
  created_at: string;
  last_updated_at: string;
}

interface ListConfigsResponse {
  success: boolean;
  data: Config[];
}

interface VirtualKeyRateLimit {
  type: 'requests';
  unit: 'rpm';
  value: number;
}

interface VirtualKeyUsageLimits {
  alert_threshold: number;
  credit_limit: number;
  periodic_reset: 'monthly';
}

interface VirtualKey {
  name: string;
  note: string | null;
  status: 'active' | 'exhausted';
  usage_limits: VirtualKeyUsageLimits | null;
  reset_usage: number | null;
  created_at: string;
  slug: string;
  model_config: Record<string, any>;
  rate_limits: VirtualKeyRateLimit[] | null;
  object: 'virtual-key';
}

interface ListVirtualKeysResponse {
  object: 'list';
  total: number;
  data: VirtualKey[];
}

interface CostDataPoint {
  timestamp: string;
  total: number;
  avg: number;
}

interface CostSummary {
  total: number;
  avg: number;
}

interface CostAnalyticsResponse {
  object: 'analytics-graph';
  data_points: CostDataPoint[];
  summary: CostSummary;
}

interface CostAnalyticsParams {
  time_of_generation_min: string;  // ISO8601 format
  time_of_generation_max: string;  // ISO8601 format
  total_units_min?: number;
  total_units_max?: number;
  cost_min?: number;
  cost_max?: number;
  prompt_token_min?: number;
  prompt_token_max?: number;
  completion_token_min?: number;
  completion_token_max?: number;
  status_code?: string;
  weighted_feedback_min?: number;
  weighted_feedback_max?: number;
  virtual_keys?: string;
  configs?: string;
  workspace_slug?: string;
  api_key_ids?: string;
  metadata?: string;
  ai_org_model?: string;
  trace_id?: string;
  span_id?: string;
}

interface ConfigTarget {
  provider?: string;
  virtual_key?: string;
}

interface ConfigDetails {
  retry?: {
    attempts?: number;
    on_status_codes?: number[];
  };
  cache?: {
    mode?: string;
    max_age?: number;
  };
  strategy?: {
    mode?: string;
  };
  targets?: ConfigTarget[];
}

interface GetConfigResponse {
  success?: boolean;
  data?: {
    config?: ConfigDetails;
  };
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

  async inviteUser(data: InviteUserRequest): Promise<InviteUserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/invites`, {  // Fixed URL
        method: 'POST',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          workspaces: data.workspaces,
          workspace_api_key_details: data.workspace_api_key_details
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to invite user: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        invite_link: result.invite_link
      };
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to invite user to Portkey');
    }
  }

  async getUserGroupedData(params: UserGroupedDataParams): Promise<UserGroupedData> {
    try {
      const queryParams = new URLSearchParams({
        time_of_generation_min: params.time_of_generation_min,
        time_of_generation_max: params.time_of_generation_max,
        ...(params.total_units_min && { total_units_min: params.total_units_min.toString() }),
        ...(params.total_units_max && { total_units_max: params.total_units_max.toString() }),
        ...(params.cost_min && { cost_min: params.cost_min.toString() }),
        ...(params.cost_max && { cost_max: params.cost_max.toString() }),
        // Add other optional parameters as needed
      });

      const response = await fetch(
        `${this.baseUrl}/analytics/groups/users?${queryParams.toString()}`, 
        {
          method: 'GET',
          headers: {
            'x-portkey-api-key': this.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as UserGroupedData;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch user grouped data from Portkey API');
    }
  }

  async listWorkspaces(params?: ListWorkspacesParams): Promise<ListWorkspacesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page_size) {
        queryParams.append('page_size', params.page_size.toString());
      }
      if (params?.current_page) {
        queryParams.append('current_page', params.current_page.toString());
      }

      const url = `${this.baseUrl}/admin/workspaces${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as ListWorkspacesResponse;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch workspaces from Portkey API');
    }
  }

  async getWorkspace(workspaceId: string): Promise<SingleWorkspaceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/workspaces/${workspaceId}`, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as SingleWorkspaceResponse;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch workspace details from Portkey API');
    }
  }

  async listConfigs(): Promise<ListConfigsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/configs`, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as ListConfigsResponse;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch configurations from Portkey API');
    }
  }

  async listVirtualKeys(): Promise<ListVirtualKeysResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/virtual-keys`, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as ListVirtualKeysResponse;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch virtual keys from Portkey API');
    }
  }

  async getCostAnalytics(params: CostAnalyticsParams): Promise<CostAnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams({
        time_of_generation_min: params.time_of_generation_min,
        time_of_generation_max: params.time_of_generation_max,
        ...(params.total_units_min && { total_units_min: params.total_units_min.toString() }),
        ...(params.total_units_max && { total_units_max: params.total_units_max.toString() }),
        ...(params.cost_min && { cost_min: params.cost_min.toString() }),
        ...(params.cost_max && { cost_max: params.cost_max.toString() }),
        ...(params.prompt_token_min && { prompt_token_min: params.prompt_token_min.toString() }),
        ...(params.prompt_token_max && { prompt_token_max: params.prompt_token_max.toString() }),
        ...(params.completion_token_min && { completion_token_min: params.completion_token_min.toString() }),
        ...(params.completion_token_max && { completion_token_max: params.completion_token_max.toString() }),
        ...(params.status_code && { status_code: params.status_code }),
        ...(params.weighted_feedback_min && { weighted_feedback_min: params.weighted_feedback_min.toString() }),
        ...(params.weighted_feedback_max && { weighted_feedback_max: params.weighted_feedback_max.toString() }),
        ...(params.virtual_keys && { virtual_keys: params.virtual_keys }),
        ...(params.configs && { configs: params.configs }),
        ...(params.workspace_slug && { workspace_slug: params.workspace_slug }),
        ...(params.api_key_ids && { api_key_ids: params.api_key_ids }),
        ...(params.metadata && { metadata: params.metadata }),
        ...(params.ai_org_model && { ai_org_model: params.ai_org_model }),
        ...(params.trace_id && { trace_id: params.trace_id }),
        ...(params.span_id && { span_id: params.span_id })
      });

      const response = await fetch(
        `${this.baseUrl}/analytics/graphs/cost?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'x-portkey-api-key': this.apiKey,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json() as CostAnalyticsResponse;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch cost analytics from Portkey API');
    }
  }

  async getConfig(slug: string): Promise<GetConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/configs/${slug}`, {
        method: 'GET',
        headers: {
          'x-portkey-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PortkeyService Error:', error);
      throw new Error('Failed to fetch configuration details from Portkey API');
    }
  }
} 