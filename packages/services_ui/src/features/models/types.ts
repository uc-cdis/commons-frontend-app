

export interface ModelRepoFile {
  type: string;
  oid: string;
  size: number;
  path: string;
}

export interface ModelRepoSibling {
  rfilename: string;
  size: number;
  blob_id: string;
}

export interface ModelRepoMetadata {
  namespace: string;
  repo: string;
  description: string;
  tags: string[];
  created_at: string; // ISO 8601 timestamp
}

export type ScanStatus = "unscanned" | string;

export interface ScanResult {
  status: ScanStatus;
}

export interface ModelRepoSecurityStatus {
  status: ScanStatus;
  jFrogScan: ScanResult;
  protectAiScan: ScanResult;
  avScan: ScanResult;
  pickleImportScan: ScanResult;
  virusTotalScan: ScanResult;
}

export interface ModelRepositoryResponse {
  id: string;
  sha: string;
  etag: string;
  size: number;
  files: ModelRepoFile[];
  siblings: ModelRepoSibling[];
  metadata: ModelRepoMetadata;
  security_status: ModelRepoSecurityStatus;
}

export interface ModelInformation {
  guid: string;
  name: string;
  description: string;
  tags?: string[];
  license: string;
  version: string;
  copyright?: string;
  createdAt?: string;
}
