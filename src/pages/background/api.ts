import { Octokit } from 'octokit';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { StoreType } from '@pages/newtab/store/store';

export const getGistData = async ({ filename, gistId }: { filename: string; gistId: string }): Promise<StoreType> => {
  const { token } = await optionsStorage.get();
  const octokit = new Octokit({
    auth: token,
  });

  const res = await octokit.request('GET /gists/{gist_id}', {
    gist_id: gistId,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  console.log('res.data.files', res.data.files);
  console.log('filename', filename);

  return JSON.parse(res.data.files[filename].content);
};
