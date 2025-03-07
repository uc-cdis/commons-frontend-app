import { NextApiRequest, NextApiResponse } from 'next';
import { data } from './data';

interface PathParameters {
  workflowName: string;
  uid: string;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the sourceId from the slug in the path
  const { query } = req;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { workflowName, uid } = query as unknown as PathParameters; // messy but this is for development

  return res.status(200).json(data);

};
export default handler;
