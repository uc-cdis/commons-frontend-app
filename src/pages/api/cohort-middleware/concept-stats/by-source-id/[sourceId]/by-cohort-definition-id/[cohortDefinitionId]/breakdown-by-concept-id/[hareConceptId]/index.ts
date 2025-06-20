import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the sourceId from the slug in the path
  // const { sourceId } = query;
  return res.status(200).json({
    concept_breakdown: [
      {
        concept_value: 'TST1',
        concept_value_as_concept_id: 2000007029,
        concept_value_name: 'non-Widget Bird',
        persons_in_cohort_with_value: 1243,
      },
      {
        concept_value: 'TST2',
        concept_value_as_concept_id: 2000007031,
        concept_value_name: 'non-Widget Bear',
        persons_in_cohort_with_value: 22344,
      },
      {
        concept_value: 'TST3',
        concept_value_as_concept_id: 2000007030,
        concept_value_name: 'non-Widget Fox',
        persons_in_cohort_with_value: 22330,
      },
      {
        concept_value: 'TST4',
        concept_value_as_concept_id: 2000007028,
        concept_value_name: 'Widget',
        persons_in_cohort_with_value: 11234,
      },
    ],
  });
};
export default handler;
