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

/**
 * Returns the backend API base URL.
 *
 * Local development:
 *   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
 *
 * Production:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://127.0.0.1:8080'
  ).replace(/\/+$/, '');

  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Generic API request helper.
 */
async function fetchJson<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const primaryUrl = buildApiUrl(cleanEndpoint);

  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(
        `API returned ${res.status}: ${res.statusText}`
      );
    }

    return await res.json();
  } catch (primaryErr: any) {
    // Local-development fallback only.
    // Production uses NEXT_PUBLIC_API_BASE_URL directly.
    if (typeof window !== 'undefined') {
      const fallbackUrls = [
        `http://localhost:8080${cleanEndpoint}`,
        `http://127.0.0.1:8080${cleanEndpoint}`,
      ];

      for (const directUrl of fallbackUrls) {
        // Don't retry the same URL we already attempted.
        if (directUrl === primaryUrl) {
          continue;
        }

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
        } catch (_) {
          // Continue to next fallback URL.
        }
      }
    }

    console.warn(
      `API request failed for [${endpoint}]:`,
      primaryErr?.message || primaryErr
    );

    throw primaryErr;
  }
}

export const api = {
  // ============================================================
  // AUTH
  // ============================================================

  async login(credentials: {
    username: string;
    password?: string;
  }): Promise<{
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

  // ============================================================
  // HEALTH
  // ============================================================

  async getHealth(): Promise<{
    status: string;
    service: string;
    aiArchitecture: any;
  }> {
    return fetchJson('/api/v1/health');
  },

  // ============================================================
  // DASHBOARD
  // ============================================================

  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJson('/api/v1/dashboard/stats');
  },

  // ============================================================
  // THREAT ACTORS
  // ============================================================

  async getActors(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }): Promise<PageResponse<ActorSummary>> {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined) {
      searchParams.set('page', params.page.toString());
    }

    if (params?.size !== undefined) {
      searchParams.set('size', params.size.toString());
    }

    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }

    if (params?.direction) {
      searchParams.set('direction', params.direction);
    }

    const qs = searchParams.toString();

    return fetchJson(
      `/api/v1/actors${qs ? `?${qs}` : ''}`
    );
  },

  async getActor(id: string): Promise<ActorDetail> {
    return fetchJson(`/api/v1/actors/${id}`);
  },

  async getActorRelationships(
    id: string
  ): Promise<RelationshipGraph> {
    return fetchJson(
      `/api/v1/actors/${id}/relationships`
    );
  },

  async getActorGraph(
    id: string
  ): Promise<RelationshipGraph> {
    return fetchJson(`/api/v1/graph/actor/${id}`);
  },

  async getActorTimeline(
    id: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<TimelineEvent>> {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined) {
      searchParams.set(
        'page',
        params.page.toString()
      );
    }

    if (params?.size !== undefined) {
      searchParams.set(
        'size',
        params.size.toString()
      );
    }

    const qs = searchParams.toString();

    return fetchJson(
      `/api/v1/timeline/actor/${id}${qs ? `?${qs}` : ''
      }`
    );
  },

  // ============================================================
  // PERSONAS
  // ============================================================

  async getPersona(
    id: string
  ): Promise<PersonaDetail> {
    return fetchJson(`/api/v1/personas/${id}`);
  },

  async getPersonaTimeline(
    id: string,
    params?: {
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<TimelineEvent>> {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined) {
      searchParams.set(
        'page',
        params.page.toString()
      );
    }

    if (params?.size !== undefined) {
      searchParams.set(
        'size',
        params.size.toString()
      );
    }

    const qs = searchParams.toString();

    return fetchJson(
      `/api/v1/timeline/persona/${id}${qs ? `?${qs}` : ''
      }`
    );
  },

  // ============================================================
  // SEARCH
  // ============================================================

  async search(params: {
    query?: string;
    q?: string;
    type?: string;
    category?: string;
    page?: number;
    size?: number;
  }): Promise<SearchResult[]> {
    const searchParams = new URLSearchParams();

    const q = params.query || params.q || '';

    if (q) {
      searchParams.set('q', q);
    }

    if (params.type && params.type !== 'ALL') {
      searchParams.set('type', params.type);
    }

    if (params.category) {
      searchParams.set(
        'category',
        params.category
      );
    }

    if (params.page !== undefined) {
      searchParams.set(
        'page',
        params.page.toString()
      );
    }

    if (params.size !== undefined) {
      searchParams.set(
        'size',
        params.size.toString()
      );
    }

    const qs = searchParams.toString();

    const raw = await fetchJson<any>(
      `/api/v1/search${qs ? `?${qs}` : ''}`
    );

    const list: any[] = Array.isArray(raw)
      ? raw
      : raw?.content || [];

    return list.map((item) => ({
      ...item,

      confidenceScore:
        item.confidenceScore ??
        item.confidence ??
        null,

      confidence:
        item.confidence ??
        item.confidenceScore ??
        null,

      metadataSnippet:
        item.metadataSnippet ??
        item.secondaryText ??
        null,

      secondaryText:
        item.secondaryText ??
        item.metadataSnippet ??
        null,

      handle:
        item.handle ??
        item.personaHandle ??
        null,

      personaHandle:
        item.personaHandle ??
        item.handle ??
        null,
    }));
  },

  // ============================================================
  // LINKAGES
  // ============================================================

  async getLinkage(
    id: string
  ): Promise<LinkageAnalysis> {
    return fetchJson(`/api/v1/linkages/${id}`);
  },

  async getEvidence(
    linkageId: string
  ): Promise<EvidenceItem[]> {
    return fetchJson(
      `/api/v1/evidence/linkage/${linkageId}`
    );
  },

  // ============================================================
  // STYLOMETRY
  // ============================================================

  async compareStylometry(data: {
    sourcePersonaId?: string;
    targetPersonaId?: string;
    textA?: string;
    textB?: string;
  }): Promise<StylometricComparison> {
    return fetchJson(
      '/api/v1/stylometry/compare',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // ============================================================
  // LINKAGE COMPUTATION
  // ============================================================

  async computeLinkage(data: {
    sourcePersonaId: string;
    targetPersonaId: string;
    includeAiExplanation?: boolean;
  }): Promise<LinkageAnalysis> {
    return fetchJson(
      '/api/v1/linkages/compute',
      {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          includeAiExplanation:
            data.includeAiExplanation ?? true,
        }),
      }
    );
  },

  // ============================================================
  // EXPORT
  // ============================================================

  getExportUrl(
    format: 'pdf' | 'json' | 'csv',
    actorId: string
  ): string {
    return buildApiUrl(
      `/api/v1/export/${format}/${actorId}`
    );
  },
};