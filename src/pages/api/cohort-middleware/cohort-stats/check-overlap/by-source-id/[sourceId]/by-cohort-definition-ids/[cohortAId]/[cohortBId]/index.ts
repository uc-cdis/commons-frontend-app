import { NextApiRequest, NextApiResponse } from 'next';
import { CohortOverlap } from '@/lib/AnalysisApps/GWAS/Utils/cohortApi';

interface PathParameters {
  sourceId: string;
  cohortAId: string;
  cohortBId: string;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the sourceId from the slug in the path
  const { query } = req;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sourceId, cohortAId, cohortBId } = query as unknown as PathParameters; // messy but this is for development

  const data: Record<string, Record<string, CohortOverlap>> = {
    '1537': {
      '446': { cohort_overlap: { case_control_overlap: 23602 } },
      '2356': { cohort_overlap: { case_control_overlap: 23602 } },
    },
    '446': {
      '2356': { cohort_overlap: { case_control_overlap: 64824 } },
    },
  };

  if (data[cohortAId] && data[cohortAId][cohortBId]) {
    return res.status(200).json(data[cohortAId][cohortBId]);
  }
  if (data[cohortBId] && data[cohortBId][cohortAId]) {
    return res.status(200).json(data[cohortBId][cohortAId]);
  }
  return res.status(200).json({ cohort_overlap: { case_control_overlap: 64824 }});

};
export default handler;
