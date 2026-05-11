import type {
  CandidateType,
  FormCandidateType,
  UpdateCandidateType,
} from '#/types/candidate';
import type {
  EmailAndPasswordLoginType,
  EmailAndPasswordRegisterFormType,
  UserType,
} from '#/types/auth';

import { env } from '#/env';
import { queryClient } from '#/integrations/query/provider';
import { QKeys } from '#/const/keys';

import DataDS from './data-ds';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const META_KEY = 'candidates-meta-v1';

type CandidateMeta = {
  age?: number | null;
  experience?: number | null;
  working?: boolean | null;
};

type ServerCandidate = {
  _id: string;
  name: string;
  lastname?: string;
  email?: string;
  position?: string;
  linkedIn?: string;
  appliedAt?: string;
  status: CandidateType['status'];
  skills: string[];
  deleted: boolean;
};

const readMetaMap = (): Record<string, CandidateMeta> => {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CandidateMeta>) : {};
  } catch {
    return {};
  }
};

const writeMeta = (id: string, meta: CandidateMeta) => {
  const map = readMetaMap();
  map[id] = { ...map[id], ...meta };
  localStorage.setItem(META_KEY, JSON.stringify(map));
};

const getMeta = (id: string): CandidateMeta => readMetaMap()[id] ?? {};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const mapServerCandidate = (raw: ServerCandidate): CandidateType => {
  const meta = getMeta(raw._id);
  return {
    id: raw._id,
    name: raw.name,
    lastname: raw.lastname ?? null,
    email: raw.email ?? null,
    position: raw.position ?? null,
    linkedIn: raw.linkedIn ?? null,
    appliedAt: raw.appliedAt ?? null,
    status: raw.status,
    skills: raw.skills ?? [],
    deleted: raw.deleted,
    age: meta.age ?? null,
    experience: meta.experience ?? null,
    working: meta.working ?? null,
  };
};

const toServerBody = (
  c: FormCandidateType | UpdateCandidateType,
): Record<string, unknown> => ({
  name: c.name,
  lastname: c.lastname ?? undefined,
  email: c.email ?? undefined,
  position: c.position ?? undefined,
  linkedIn: c.linkedIn || undefined,
  status: c.status,
  skills: c.skills,
});

class ApiDS extends DataDS {
  private readonly baseUrl: string;

  constructor() {
    super();
    this.baseUrl = env.VITE_API_URL.replace(/\/$/, '');
  }

  private getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    auth = true,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) ?? {}),
    };
    if (auth) {
      const token = this.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message =
        (data && (data.message as string)) ||
        `Request failed with status ${res.status}`;
      throw new Error(message);
    }
    return data as T;
  }

  async getCandidates(status?: string | null) {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    const list = await this.request<ServerCandidate[]>(
      `/api/v1/candidates${qs}`,
    );
    return list.filter((c) => !c.deleted).map(mapServerCandidate);
  }

  async getCandidateById(id: string) {
    const raw = await this.request<ServerCandidate>(`/api/v1/candidates/${id}`);
    if (raw.deleted) throw new Error('Candidato no existe');
    return mapServerCandidate(raw);
  }

  async saveCandidate(candidate: FormCandidateType) {
    const body = toServerBody(candidate);
    const result = await this.request<{ newCandidate: ServerCandidate }>(
      `/api/v1/candidates/`,
      { method: 'POST', body: JSON.stringify(body) },
    );
    const newId = result.newCandidate._id;
    writeMeta(newId, {
      age: candidate.age ?? null,
      experience: candidate.experience ?? null,
      working: candidate.working ?? null,
    });
    return true;
  }

  async updateCandidate(candidate: UpdateCandidateType) {
    const body = toServerBody(candidate);
    await this.request<{ candidateUpdated: ServerCandidate }>(
      `/api/v1/candidates/${candidate.id}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
    writeMeta(candidate.id, {
      age: candidate.age ?? null,
      experience: candidate.experience ?? null,
      working: candidate.working ?? null,
    });
    return candidate.id;
  }

  async deleteCandidate(id: string) {
    await this.request(`/api/v1/candidates/${id}`, { method: 'DELETE' });
    return true;
  }

  async toggleWorking(id: string, newWorkingValue: boolean) {
    writeMeta(id, { working: newWorkingValue });
    await queryClient.invalidateQueries({
      queryKey: QKeys.GET_CANDIDATE_BY_ID(id),
    });
    return newWorkingValue;
  }

  async registerWithEmailAndPassword(params: EmailAndPasswordRegisterFormType) {
    await this.request<{ id: string; message: string }>(
      `/api/v1/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          name: params.name,
        }),
      },
      false,
    );

    return await this.loginWithEmailAndPassword(
      { email: params.email, password: params.password },
      params.name,
    );
  }

  async loginWithEmailAndPassword(
    params: EmailAndPasswordLoginType,
    nameOverride?: string,
  ) {
    const result = await this.request<{ token: string; id: string }>(
      `/api/v1/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      false,
    );

    localStorage.setItem(TOKEN_KEY, result.token);

    const payload = decodeJwtPayload(result.token);
    const session: UserType = {
      id: result.id,
      email: (payload?.email as string) ?? params.email,
      name: nameOverride ?? params.email.split('@')[0],
    };
    localStorage.setItem(USER_KEY, JSON.stringify(session));
    return session;
  }

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!raw || !token) return null;

    const payload = decodeJwtPayload(token);
    if (payload && typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSec) {
        await this.logout();
        return null;
      }
    }

    try {
      return JSON.parse(raw) as UserType;
    } catch {
      return null;
    }
  }
}

export default ApiDS;
