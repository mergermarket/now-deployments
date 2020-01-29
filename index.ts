import * as core from '@actions/core';

function wait(milliseconds: number): Promise<string> {
  return new Promise((resolve) => {
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number');
    }

    setTimeout(() => resolve('done!'), milliseconds);
  });
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds');
    core.debug(`Waiting ${ms} milliseconds ...`);
    core.debug(JSON.stringify(process.env));

    core.debug(new Date().toTimeString());
    await wait(parseInt(ms, 10));
    core.debug(new Date().toTimeString());

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
