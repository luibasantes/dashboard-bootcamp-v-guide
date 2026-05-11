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

import seed from '#/api/data.json';
import { queryClient } from '#/integrations/query/provider';
import { QKeys } from '#/const/keys';

import DataDS from './data-ds';

const CANDIDATES_KEY = 'candidates-v1';
const USERS_KEY = 'users-v1';
const CURRENT_USER_KEY = 'current-user-v1';

type StoredUser = UserType & { password: string };

const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

class JsonDS extends DataDS {
  constructor() {
    super();
    if (typeof localStorage === 'undefined') return;

    if (!localStorage.getItem(CANDIDATES_KEY)) {
      localStorage.setItem(CANDIDATES_KEY, JSON.stringify(seed.candidates));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(seed.users));
    }
  }

  private getCandidatesRaw(): CandidateType[] {
    const raw = localStorage.getItem(CANDIDATES_KEY);
    return raw ? (JSON.parse(raw) as CandidateType[]) : [];
  }

  private setCandidatesRaw(candidates: CandidateType[]) {
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
  }

  private getUsersRaw(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  }

  private setUsersRaw(users: StoredUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async getCandidates(status?: string | null) {
    await sleep();
    const candidates = this.getCandidatesRaw().filter((c) => !c.deleted);
    if (status) {
      return candidates.filter((c) => c.status === status);
    }
    return candidates;
  }

  async getCandidateById(id: string) {
    await sleep(200);
    const candidate = this.getCandidatesRaw().find((c) => c.id === id);
    if (!candidate || candidate.deleted) {
      throw new Error('Candidato no existe');
    }
    return candidate;
  }

  async saveCandidate(candidate: FormCandidateType) {
    await sleep();
    const candidates = this.getCandidatesRaw();
    const newCandidate: CandidateType = {
      ...candidate,
      id: crypto.randomUUID(),
      deleted: false,
    };
    candidates.push(newCandidate);
    this.setCandidatesRaw(candidates);
    return true;
  }

  async updateCandidate(candidate: UpdateCandidateType) {
    await sleep();
    const candidates = this.getCandidatesRaw();
    const idx = candidates.findIndex((c) => c.id === candidate.id);
    if (idx === -1) {
      throw new Error('Candidato no existe');
    }
    candidates[idx] = { ...candidates[idx], ...candidate };
    this.setCandidatesRaw(candidates);
    return candidate.id;
  }

  async deleteCandidate(id: string) {
    await sleep();
    const candidates = this.getCandidatesRaw();
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Candidato no existe');
    }
    candidates[idx] = { ...candidates[idx], deleted: true };
    this.setCandidatesRaw(candidates);
    return true;
  }

  async toggleWorking(id: string, newWorkingValue: boolean) {
    await sleep(200);
    const candidates = this.getCandidatesRaw();
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Candidato no existe');
    }
    candidates[idx] = { ...candidates[idx], working: newWorkingValue };
    this.setCandidatesRaw(candidates);

    await queryClient.invalidateQueries({
      queryKey: QKeys.GET_CANDIDATE_BY_ID(id),
    });

    return newWorkingValue;
  }

  async registerWithEmailAndPassword(params: EmailAndPasswordRegisterFormType) {
    await sleep();
    const users = this.getUsersRaw();
    if (users.some((u) => u.email === params.email)) {
      throw new Error('El correo ya está registrado');
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: params.email,
      password: params.password,
      name: params.name,
    };
    users.push(newUser);
    this.setUsersRaw(users);

    const session: UserType = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    return session;
  }

  async loginWithEmailAndPassword(params: EmailAndPasswordLoginType) {
    await sleep();
    const user = this.getUsersRaw().find(
      (u) => u.email === params.email && u.password === params.password,
    );
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const session: UserType = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));
    return session;
  }

  async logout() {
    await sleep(200);
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  async getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserType;
    } catch {
      return null;
    }
  }
}

export default JsonDS;
