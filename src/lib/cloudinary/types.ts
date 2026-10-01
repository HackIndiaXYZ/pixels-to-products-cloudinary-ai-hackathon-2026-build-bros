export interface SecurityEvidence {
  assetId: string;
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw" | "auto";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: string;
  tags: string[];
  metadata: Record<string, string>;
}
