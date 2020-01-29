import * as core from '@actions/core';
import { context as githubContext } from '@actions/github';
import commander from './lib/cmd';

async function run(): Promise<void> {
  const githubToken = core.getInput('github-token');
  const zeitToken = core.getInput('zeit-token');
  const nowArgs = core.getInput('now-args');
  const workingDirectory = core.getInput('working-directory');
  const teamId = core.getInput('team-id');

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
