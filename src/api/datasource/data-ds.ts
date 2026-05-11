import type {
  EmailAndPasswordLoginType,
  EmailAndPasswordRegisterFormType,
  UserType,
} from '#/types/auth';
import type {
  CandidateType,
  FormCandidateType,
  UpdateCandidateType,
} from '#/types/candidate';

abstract class DataDS {
  abstract getCandidates(status?: string | null): Promise<Array<CandidateType>>;

  abstract getCandidateById(id: string): Promise<CandidateType>;

  abstract saveCandidate(candidate: FormCandidateType): Promise<boolean>;

  abstract updateCandidate(candidate: UpdateCandidateType): Promise<string>;

  abstract deleteCandidate(id: string): Promise<boolean>;

  abstract toggleWorking(
    id: string,
    newWorkingValue: boolean,
  ): Promise<boolean>;

  // Auth
  abstract registerWithEmailAndPassword(
    params: EmailAndPasswordRegisterFormType,
  ): Promise<UserType>;

  abstract loginWithEmailAndPassword(
    params: EmailAndPasswordLoginType,
  ): Promise<UserType>;

  abstract logout(): Promise<void>;

  abstract getCurrentUser(): Promise<UserType | null>;
}

export default DataDS;
