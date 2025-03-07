import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Get the sourceId from the slug in the path
  // const { sourceId } = query;
  return res.status(200).json({"workflow_run":0,"workflow_limit":50});
};

export default handler;
