import type { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { GEN3_API } from "@gen3/core";
// import { Agent } from "undici";
//
// const agent = new Agent({ keepAliveTimeout: 1, pipelining: 0 });
//
// async function postWithRetry(url: string, body: string, tries = 2) {
//     for (let i = 0; i < tries; i++) {
//         try {
//             return await fetch(url, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", Connection: "close" },
//                 body,
//                 // @ts-expect-error dispatcher is supported by Node's fetch
//                 dispatcher: agent,
//             });
//         } catch (e: any) {
//             const code = e?.cause?.code;
//             if (i === tries - 1 || !["EPIPE", "ECONNRESET", "UND_ERR_SOCKET"].includes(code)) throw e;
//         }
//     }
// }


export const GEN3_INFERENCE_SERVICE =
  process.env.GEN3_INFERENCE_SERVICE || `${GEN3_API}/inference`;

const MOCKED_DATA_DIR = './data/inference_response';

const USE_MOCK = process.env.GEN3_MOCK_INFERENCE_SERVICE || false;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    console.log("inference api called");

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { tsv, sample_id } = req.body;
    if (!tsv || !sample_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }


    // mock the API server when in development mode:
    if (USE_MOCK) {
        try {
            // given the sample_id load the corresponding tsv file
            const jsonFilePath = `${MOCKED_DATA_DIR}/${sample_id}`.replace(".tsv", ".json");
            const jsonContent = await readFile(jsonFilePath, 'utf8');
            return res.status(200).json(JSON.parse(jsonContent));
        } catch (e: unknown) {
            console.error(`inference mock failed for sample_id "${sample_id}":`, e);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    else {
        // fetch from the inference service
        const inferenceApi = GEN3_INFERENCE_SERVICE;
        if (!inferenceApi) {
            console.error('INFERENCE_API is not set');
            return res.status(500).json({ message: 'Inference service is not configured' });
        }
        try {
            console.log(`fetching from inference service: ${inferenceApi}`);
            const response = await fetch(inferenceApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Connection: "close" },
                body: JSON.stringify({ tsv, sample_id }),
            });

         //   const response = await postWithRetry(inferenceApi, JSON.stringify({ tsv, sample_id }));
            if (!response) throw new Error('No response from inference service');
            if (!response.ok) {
                console.error(
                  `inference service failed for sample_id "${sample_id}": ${response.status} ${response.statusText}`,
                  await response.text(),
                );
                return res.status(502).json({ message: `Inference service returned ${response.status}` });
            }
            return res.status(200).json(await response.json());
        } catch (e: unknown) {
            console.error(`inference request failed for sample_id "${sample_id}":`, e);
            return res.status(502).json({ message: 'Inference service unreachable' });
        }
    }
}
