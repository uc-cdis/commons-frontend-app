import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  setTimeout(() => {
    return res.status(200).json({"workflow_id": 123});
  }, 800); // 800 milliseconds delay
};

export default handler;
