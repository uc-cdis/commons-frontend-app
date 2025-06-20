import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({
    sources: [
      {
        source_id: 22,
        source_name: 'Synthetic OMOP',
      },
    ],
  });
};
export default handler;
