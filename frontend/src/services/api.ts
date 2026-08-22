import {
  ActorDetail,
  ActorSummary,
  DashboardStats,
  EvidenceItem,
  LinkageAnalysis,
  PageResponse,
  PersonaDetail,
  RelationshipGraph,
  SearchResult,
  StylometricComparison,
  TimelineEvent,
} from '@/types';

export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // In the browser, try relative path so Next.js rewrites proxy to backend
  if (typeof window !== 'undefined') {
    return cleanEndpoint;
  }

  // On server-side (Node.js / SSR)
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
  if (base.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
    return `${base}${cleanEndpoint.replace(/^\/api\/v1/, '')}`;
  }
  return `${base}${cleanEndpoint}`;
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isBrowser = typeof window !== 'undefined';

  // Primary URL candidate: relative in browser, backend URL in SSR
  const primaryUrl = isBrowser ? cleanEndpoint : `http://127.0.0.1:8080${cleanEndpoint}`;

  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (primaryErr: any) {
    // If browser relative call failed, attempt direct fetch to 8080
    if (isBrowser) {
      const fallbackUrls = [
        `http://localhost:8080${cleanEndpoint}`,
        `http://127.0.0.1:8080${cleanEndpoint}`,
      ];

      for (const directUrl of fallbackUrls) {
        try {
          const directRes = await fetch(directUrl, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          if (directRes.ok) {
            return await directRes.json();
          }
        } catch (_) {}
      }
    }

    console.warn(`API request failed for [${endpoint}]:`, primaryErr?.message || primaryErr);
    throw primaryErr;
  }
}

export const api = {
  // Auth
  async login(credentials: { username: string; password?: string }): Promise<{
    token: string;
    username: string;
    role: string;
    unit: string;
    classification: string;
  }> {
    return fetchJson('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Health
  async getHealth(): Promise<{ status: string; service: string; aiArchitecture: any }> {
    return fetchJson('/api/v1/health');
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJson('/api/v1/dashboard/stats');
  },

  // Threat Actors
  async getActors(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }): Promise<PageResponse<ActorSummary>> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.direction) searchParams.set('direction', params.direction);
    const qs = searchParams.toString();
    return fetchJson(`/api/v1/actors${qs ? `?${qs}` : ''}`);
  },

  async getActor(id: string): Promise<ActorDetail> {
    return fetchJson(`/api/v1/actors/${id}`);
  },

  async getActorRelationships(id: string): Promise<RelationshipGraph> {
    return fetchJson(`/api/v1/actors/${id}/relationships`);
  },

  async getActorGraph(id: string): Promise<RelationshipGraph> {
    return fetchJson(`/api/v1/graph/actor/${id}`);
  },

  async getActorTimeline(
    id: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<TimelineEvent>> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    const qs = searchParams.toString();
    return fetchJson(`/api/v1/timeline/actor/${id}${qs ? `?${qs}` : ''}`);
  },

  // Personas
  async getPersona(id: string): Promise<PersonaDetail> {
    return fetchJson(`/api/v1/personas/${id}`);
  },

  async getPersonaTimeline(
    id: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<TimelineEvent>> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    const qs = searchParams.toString();
    return fetchJson(`/api/v1/timeline/persona/${id}${qs ? `?${qs}` : ''}`);
  },

  // Search
  async search(params: {
    query?: string;
    q?: string;
    type?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<SearchResult>> {
    const searchParams = new URLSearchParams();
    const q = params.query || params.q || '';
    if (q) searchParams.set('q', q);
    if (params.type) searchParams.set('type', params.type);
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    const qs = searchParams.toString();
    return fetchJson(`/api/v1/search${qs ? `?${qs}` : ''}`);
  },

  // Linkages
  async getLinkage(id: string): Promise<LinkageAnalysis> {
    return fetchJson(`/api/v1/linkages/${id}`);
  },

  async getEvidence(linkageId: string): Promise<EvidenceItem[]> {
    return fetchJson(`/api/v1/evidence/linkage/${linkageId}`);
  },

  // Stylometry comparison
  async compareStylometry(data: {
    sourcePersonaId?: string;
    targetPersonaId?: string;
    textA?: string;
    textB?: string;
  }): Promise<StylometricComparison> {
    return fetchJson('/api/v1/stylometry/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Linkage computation
  async computeLinkage(data: {
    sourcePersonaId: string;
    targetPersonaId: string;
    includeAiExplanation?: boolean;
  }): Promise<LinkageAnalysis> {
    return fetchJson('/api/v1/linkages/compute', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        includeAiExplanation: data.includeAiExplanation ?? true,
      }),
    });
  },

  // Export URLs
  getExportUrl(format: 'pdf' | 'json' | 'csv', actorId: string): string {
    return `/api/v1/export/${format}/${actorId}`;
  },
};
