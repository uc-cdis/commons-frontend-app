import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json([
    {
      name: 'gwas-workflow-5824608351',
      phase: 'Succeeded',
      submittedAt: '2025-01-21T19:42:42Z',
      startedAt: '2025-01-21T19:42:42Z',
      finishedAt: '2025-01-21T22:10:05Z',
      wf_name: 'test 1',
      gen3teamproject: '/synthetic_project',
      uid: '96816116-0928-4f57-97be-a7d26921b71e',
    },
    {
      name: 'gwas-workflow-9136614877',
      phase: 'Failed',
      submittedAt: '2025-01-21T18:51:35Z',
      startedAt: '2025-01-21T18:51:35Z',
      finishedAt: '2025-01-21T18:55:23Z',
      wf_name: 'test 1',
      gen3teamproject: '/synthetic_project',
      uid: '2c17fc87-ffea-4b00-bd67-9f8246928905',
    },
    {
      name: 'gwas-workflow-7839282168',
      phase: 'Failed',
      submittedAt: '2025-01-21T18:41:40Z',
      startedAt: '2025-01-21T18:41:40Z',
      finishedAt: '2025-01-21T18:47:55Z',
      wf_name: 'test 1',
      gen3teamproject: '/synthetic_project',
      uid: '2b88bcaf-0387-4684-b619-44e033311dbe',
    },
    {
      name: 'gwas-workflow-6352441170',
      phase: 'Succeeded',
      submittedAt: '2024-12-16T19:05:41Z',
      startedAt: '2024-12-16T19:05:41Z',
      finishedAt: '2024-12-16T20:02:59Z',
      wf_name: 'test2',
      gen3teamproject: '/synthetic_project',
      uid: '26ded9de-2ded-400c-a8bd-1c714477088b',
    },
    {
      name: 'gwas-workflow-7517040581',
      phase: 'Succeeded',
      submittedAt: '2024-12-16T19:06:26Z',
      startedAt: '2024-12-16T19:06:26Z',
      finishedAt: '2024-12-16T20:02:48Z',
      wf_name: 'test3',
      gen3teamproject: '/synthetic_project',
      uid: '7790a93f-ac91-49e2-a134-afbde382f5a1',
    },
    {
      name: 'gwas-workflow-523904108',
      phase: 'Succeeded',
      submittedAt: '2024-12-16T19:03:43Z',
      startedAt: '2024-12-16T19:03:43Z',
      finishedAt: '2024-12-16T19:59:27Z',
      wf_name: 'test1',
      gen3teamproject: '/synthetic_project',
      uid: '640aac96-f2f2-43dd-b450-bc6c5e826542',
    },
  ]);
};

export default handler;
