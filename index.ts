import * as core from '@actions/core';
import { context as githubContext } from '@actions/github';
import commander from './lib/cmd';

async function run(): Promise<void> {
  const githubToken = core.getInput('github-token');
  const zeitToken = core.getInput('zeit-token');
  const nowArgs = core.getInput('now-args');
  const workingDirectory = core.getInput('working-directory');
  const teamId = core.getInput('team-id');

  console.log('context', JSON.stringify(githubContext), '\n\n');
  console.log('issue', JSON.stringify(githubContext.issue), '\n\n');
  console.log('payload pull_request', JSON.stringify(githubContext.payload.pull_request), '\n\n');
  console.log('payload issue', JSON.stringify(githubContext.payload.issue), '\n\n');

  const cmd = commander({
    githubToken, zeitToken, githubContext, teamId,
  });

  await cmd.deploy({
    nowArgs,
    execOptions: { cwd: workingDirectory },
  });

  await cmd.comment();
}

run().catch((error: Error) => core.setFailed(error.message));
