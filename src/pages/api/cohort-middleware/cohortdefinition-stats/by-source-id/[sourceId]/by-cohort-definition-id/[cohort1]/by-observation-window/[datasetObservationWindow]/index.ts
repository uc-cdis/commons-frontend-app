import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  return res.status(200).json({
    cohort_definition_and_stats:
      {
        size: 114,
      },
  });
};
export default handler;
