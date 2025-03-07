import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  return res.status(200).json({
    sources: [{ source_id: 123, source_name: 'MVP-batch19000101' }],
  });
};

export default handler;
