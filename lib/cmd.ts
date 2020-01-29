import { exec } from '@actions/exec';
import { GitHub } from '@actions/github';
import { stripIndents } from 'common-tags';
import zeitClient from './api/zeit';
import {
  CmdContext, DeployOptions, CmdOptions, Deployment,
} from './types';

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

  const { data: commitData } = await githubApi.repos.listCommentsForCommit({
    ...githubContext.repo,
    commit_sha: lastDeployment.meta.commit,
  });

  const lastComment = commitData.find((c) => c.body.startsWith(messageHeader));

  if (lastComment) {
    await githubApi.repos.updateCommitComment({
      ...githubContext.repo,
      comment_id: lastComment.id,
      body: message,
    });
  } else {
    await githubApi.repos.createCommitComment({
      ...githubContext.repo,
      commit_sha: lastDeployment.meta.commit,
      body: message,
    });
  }
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
