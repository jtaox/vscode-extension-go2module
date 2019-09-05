export class DeclarationError {
  public code: number;
  public msg: string;

  constructor(code: number, msg: string) {
    this.code = code;
    this.msg = msg;
  }
}

export const noFoundNodeModulesError = new DeclarationError(1, '')
export const noFoundDependenceError = new DeclarationError(2, '')
export const fetchGithubInfoError = new DeclarationError(3, '')
export const repositoryUndefinedError = new DeclarationError(4, '')
export const notGithubRepositoryError = new DeclarationError(5, '')
