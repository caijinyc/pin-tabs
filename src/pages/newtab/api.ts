import { Octokit } from 'octokit';
import { optionsStorage } from '@src/shared/storages/optionsStorage';

export const getGistData = async () => {
  const { gistId, token } = await optionsStorage.get();
  const octokit = new Octokit({
    auth: token,
  });
  const data = await octokit.request('GET /gists/{gist_id}', {
    gist_id: gistId,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  return data;
};
