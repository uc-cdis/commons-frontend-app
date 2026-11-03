import { UMAP } from "umap-js";
import type { PlotPoint } from "../types";
import type { EmbeddingRecord} from "../core/types"
import type { GroundEmbeddings } from "./extractAllEmbeddings";


export interface EmbeddingResponse {
  available_embeddings_count?: number;
  embeddings: EmbeddingRecord[];
}

// ---- Loading ----
async function loadJson(url: string): Promise<EmbeddingResponse> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

/**
 * Loads the TCGA and input files and returns what umap-js needs:
 * a single number[][] (TCGA rows first, then input rows), plus the
 * metadata arrays so the index can map back results.
 */
export async function loadUmapInputs(tcga: EmbeddingResponse, input: EmbeddingResponse) {

  const tcgaVectors = tcga.embeddings.map((e) => e.vector);
  const inputVectors = input.embeddings.map((e) => e.vector);

  return {
    // equivalent of np.concatenate([X_tcga, X_input])
    matrix: [...tcgaVectors, ...inputVectors],
    nTcga: tcgaVectors.length,
    tcgaMetadata: tcga.embeddings.map((e) => e.info.metadata),
    inputMetadata: input.embeddings.map((e) => e.info.metadata),
  };
}


/**
 * Same result as loadUmapInputs, built from GroundEmbeddings (typed-array vectors with parallel metadata)
 * instead of API-shaped records. umap-js and cosine take plain number[] rows, so each vector is copied.
 */
export function groundToUmapInputs(tcga: GroundEmbeddings, input: GroundEmbeddings) {
  const tcgaVectors = tcga.vectors.map((v) => Array.from(v));
  const inputVectors = input.vectors.map((v) => Array.from(v));

  return {
    // equivalent of np.concatenate([X_tcga, X_input])
    matrix: [...tcgaVectors, ...inputVectors],
    nTcga: tcgaVectors.length,
    tcgaMetadata: tcga.metadata,
    inputMetadata: input.metadata,
  };
}

// ---- Cosine distance + seeded RNG (see earlier answer) ----
export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return 1 - dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface UmapComparison {
  tcga: PlotPoint[];
  input: PlotPoint[];
}

export async function runUmap(
  tcga: EmbeddingResponse,
  input: EmbeddingResponse,
  onProgress?: (epoch: number) => void
): Promise<UmapComparison> {
  return fitUmap(await loadUmapInputs(tcga, input), onProgress);
}

/** runUmap for GroundEmbeddings inputs. */
export function runUmapGround(
  tcga: GroundEmbeddings,
  input: GroundEmbeddings,
  onProgress?: (epoch: number) => void
): Promise<UmapComparison> {
  return fitUmap(groundToUmapInputs(tcga, input), onProgress);
}

async function fitUmap(
  { matrix, nTcga, tcgaMetadata, inputMetadata }: ReturnType<typeof groundToUmapInputs>,
  onProgress?: (epoch: number) => void
): Promise<UmapComparison> {

  const umap = new UMAP({
    nComponents: 2,
    nNeighbors: 15,
    minDist: 0.1,
    distanceFn: cosine,
    random: mulberry32(42),
  });

  const coords = await umap.fitAsync(matrix, (epoch) => {
    onProgress?.(epoch);
    return true; // returning false would stop early
  });

  const tcgaPoints: PlotPoint[] = tcgaMetadata.map((m, i) => ({
    umap_x: coords[i][0],
    umap_y: coords[i][1],
    group: m.project_id,
    metadata: m,
  }));

  const inputPoints: PlotPoint[] = inputMetadata.map((m, i) => ({
    umap_x: coords[nTcga + i][0],
    umap_y: coords[nTcga + i][1],
    group: "NCICCR-DLBCL (input)",
    metadata: m,
  }));

  return { tcga: tcgaPoints, input: inputPoints} ;

}
