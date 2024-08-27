export type ImagesFromCloudinary = {
  total_count: number;
  time: number;
  next_cursor: string;
  resources: Resource[];
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
} | null;

export interface Resource {
  context: {
    alt: string;
    gptGenerated: true;
  };
  asset_id: string;
  public_id: string;
  asset_folder: string;
  filename: string;
  display_name: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  uploaded_at: string;
  bytes: number;
  backup_bytes: number;
  width: number;
  height: number;
  aspect_ratio: number;
  pixels: number;
  pages: number;
  url: string;
  secure_url: string;
  status: string;
  access_mode: string;
  etag: string;
  created_by: CreatedBy;
  uploaded_by: UploadedBy;
  last_updated: LastUpdated;
}

interface CreatedBy {
  access_key: string;
  custom_id: string;
  external_id: string;
}

interface UploadedBy {
  access_key: string;
  custom_id: string;
  external_id: string;
}

interface LastUpdated {
  context_updated_at: string;
  updated_at: string;
}
