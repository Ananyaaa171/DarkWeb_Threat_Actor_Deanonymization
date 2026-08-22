import {
  ActorDetail,
  ActorSummary,
  EvidenceItem,
  LinkageAnalysis,
  PageResponse,
  PersonaDetail,
  RelationshipGraph,
  SearchResult,
  StylometricComparison,
  TimelineEvent,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `API Error: ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.message) errorMsg = errorJson.message;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API request unavailable for [${endpoint}]:`, err?.message || err);
    throw err;
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
  async getDashboardStats(): Promise<{
    totalThreatActors: number;
    trackedPersonas: number;
    activeInvestigations: number;
    highConfidenceLinkages: number;
    monitoredIdentifiers: number;
    activeInfrastructure: number;
    categoryDistribution: Record<string, number>;
  }> {
    return fetchJson('/api/v1/dashboard/stats');
  },

  // Actors
  async getActors(params?: {
    category?: string;
    minConfidence?: number;
    q?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<ActorSummary>> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'ALL') query.set('category', params.category);
    if (params?.minConfidence) query.set('minConfidence', params.minConfidence.toString());
    if (params?.q) query.set('q', params.q);
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());

    return fetchJson(`/api/v1/actors?${query.toString()}`);
  },

  async getActor(id: string): Promise<ActorDetail> {
    return fetchJson(`/api/v1/actors/${id}`);
  },

  // Personas
  async getPersona(id: string): Promise<PersonaDetail> {
    return fetchJson(`/api/v1/personas/${id}`);
  },

  // Search
  async search(params: {
    q: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SearchResult[]> {
    const query = new URLSearchParams();
    query.set('q', params.q);
    if (params.type && params.type !== 'ALL') query.set('type', params.type);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    return fetchJson(`/api/v1/search?${query.toString()}`);
  },

  // Timeline
  async getActorTimeline(
    actorId: string,
    params?: { startDate?: string; endDate?: string; page?: number; size?: number }
  ): Promise<PageResponse<TimelineEvent>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());

    return fetchJson(`/api/v1/timeline/actor/${actorId}?${query.toString()}`);
  },

  async getPersonaTimeline(
    personaId: string,
    params?: { startDate?: string; endDate?: string; page?: number; size?: number }
  ): Promise<PageResponse<TimelineEvent>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());

    return fetchJson(`/api/v1/timeline/persona/${personaId}?${query.toString()}`);
  },

  // Relationships / Graph
  async getActorRelationships(actorId: string): Promise<RelationshipGraph> {
    return fetchJson(`/api/v1/actors/${actorId}/relationships`);
  },

  async getActorGraph(actorId: string): Promise<RelationshipGraph> {
    return fetchJson(`/api/v1/graph/actor/${actorId}`);
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
    return `${API_BASE_URL}/api/v1/export/${format}/${actorId}`;
  },
};
