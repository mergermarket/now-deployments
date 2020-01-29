import { exec } from '@actions/exec';
import { GitHub } from '@actions/github';
import { stripIndents } from 'common-tags';
import zeitClient from './api/zeit';
import {
  CmdContext, DeployOptions, CmdOptions, Deployment,
} from './types';

export interface LastCommentOptions extends Pick<CmdContext, 'githubApi' | 'githubContext'> {
  lastDeploymentCommit: string;
}

export interface UpdateOrCreateCommentOptions extends LastCommentOptions {
  lastCommentId?: number;
  message: string;
}

const zeitURL = 'https://api.zeit.co';
const messageHeader = 'Preview ready!';

const deploy = (context: CmdContext) => async (options: DeployOptions) => {
  const { zeitToken, githubContext } = context;
  const {
    nowArgs, execOptions,
  } = options;

  return exec('npx', [
    'now',
    ...(nowArgs.split(/ +/)),
    '-t',
    zeitToken,
    '-m',
    `commit=${githubContext.sha}`,
    '-m',
    `branch=${githubContext.ref}`,
  ],
  execOptions);
};

const generateCommitMessage = (payload: Deployment) => {
  const { meta: { commit }, url } = payload;
  return stripIndents`
    ${messageHeader}
    Commit: ${commit}
    URL: https://${url}
  `;
};

const getLastComment = async (options: LastCommentOptions) => {
  const { githubContext, githubApi, lastDeploymentCommit } = options;
  const payload = {
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
  };

  if (githubContext.eventName === 'push') {
    const { data } = await githubApi.repos.listCommentsForCommit({
      ...payload,
      commit_sha: lastDeploymentCommit,
    });
    return data.find((c) => c.body.startsWith(messageHeader));
  }

  if (githubContext.eventName === 'pull_request') {
    const { data } = await githubApi.issues.listComments({
      ...payload,
      issue_number: githubContext.issue.number,
    });
    return data.find((c) => c.body.startsWith(messageHeader));
  }
  return null;
};

const updateOrCreateComment = async (options: UpdateOrCreateCommentOptions) => {
  const {
    lastCommentId, githubApi, githubContext, message, lastDeploymentCommit,
  } = options;
  const isPR = githubContext.eventName === 'pull_request';
  const isCommit = githubContext.eventName === 'push';
  const payload = {
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    body: message,
  };

  if (isPR && lastCommentId) {
    await githubApi.issues.updateComment({
      ...payload,
      comment_id: lastCommentId,
    });
    return;
  }

  if (isCommit && lastCommentId) {
    await githubApi.repos.updateCommitComment({
      ...payload,
      comment_id: lastCommentId,
    });
    return;
  }

  if (isPR) {
    await githubApi.issues.createComment({
      ...payload,
      issue_number: githubContext.issue.number,
    });
    return;
  }

  if (isCommit) {
    await githubApi.repos.createCommitComment({
      ...payload,
      commit_sha: lastDeploymentCommit,
    });
  }
};

const comment = (cmdContext: CmdContext) => async () => {
  const {
    githubContext, zeitApi, teamId, githubApi,
  } = cmdContext;

  const deploymentStrategies = [
    zeitApi.getDeployments({ 'meta-commit': githubContext.sha, ...(teamId && { teamId }) }),
    zeitApi.getDeployments({ 'meta-branch': githubContext.ref, ...(teamId && { teamId }) }),
    zeitApi.getDeployments({ limit: 1, ...(teamId && { teamId }) }),
  ];

  const deployments = await Promise.all(deploymentStrategies);
  const lastDeployment = deployments
    .find((deployment) => deployment.url !== undefined) as Deployment;

  const message = generateCommitMessage(lastDeployment);

  const lastComment = await getLastComment({
    githubContext,
    githubApi,
    lastDeploymentCommit: lastDeployment.meta.commit,
  });

  await updateOrCreateComment({
    githubContext,
    githubApi,
    lastDeploymentCommit: lastDeployment.meta.commit,
    lastCommentId: lastComment?.id,
    message,
  });
};

export default (options: CmdOptions) => {
  const {
    githubToken, zeitToken, githubContext, teamId,
  } = options;
  const githubApi = new GitHub(githubToken);
  const zeitApi = zeitClient({ baseURL: zeitURL, token: zeitToken });
  const context = {
    githubContext, githubApi, zeitApi, zeitToken, teamId,
  };

  return {
    comment: comment(context),
    deploy: deploy(context),
  };
};
