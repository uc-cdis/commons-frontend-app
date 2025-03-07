import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Get the sourceId from the slug in the path
  // const { query } = req;
  // const { sourceId } = query;
  return res.status(200).json({
    cohort_definitions_and_stats: [
      {
        cohort_definition_id: 573,
        cohort_name: 'team2 - test new cohort - catch all',
        size: 70240,
      },
      {
        cohort_definition_id: 559,
        cohort_name: 'test new cohort - catch all',
        size: 70240,
      },
      {
        cohort_definition_id: 574,
        cohort_name: 'team2 - test new cohort - medium + large',
        size: 23800,
      },
      {
        cohort_definition_id: 575,
        cohort_name: 'team2 - test new cohort - small',
        size: 80,
      },
    ],
  });
};
export default handler;
