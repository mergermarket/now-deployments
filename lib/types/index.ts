import { context as GithubContext, GitHub } from '@actions/github'

export interface Deployment {
  uid: string
  name: string
  url: string
  state: string
  meta: {
    commit: string
    branch: string
  }
}

export type ZeitMetaParams =
  | { 'meta-commit': string; teamId?: string }
  | { 'meta-branch': string; teamId?: string }
  | { limit: number; teamId?: string }

export interface ZeitApi {
  getDeployments: (params: ZeitMetaParams) => Promise<any>
}

export interface DeployOptions {
  nowArgs: string
  execOptions: { cwd: string }
}

export interface CmdOptions {
  githubToken: string
  zeitToken: string
  teamId?: string
  githubContext: typeof GithubContext
}

export interface CmdContext {
  githubApi: GitHub
  zeitApi: ZeitApi
  zeitToken: string
  teamId?: string
  githubContext: typeof GithubContext
}

export interface ZeitConfig extends APIClientConfig {}

export interface APIClientConfig {
  baseURL: string
  token: string
}
