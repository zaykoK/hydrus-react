export type APIResponseMetadata = {
  metadata:Array<MetadataResponse>;
}

export type APIResponseSearch = {
  hashes?:Array<string>;
  file_ids?:Array<number>;
}

export type MetadataResponse = {
  time_modified_details: { [key: string]: number; };
  duration: number | null;
  ext: string;
  file_id: number;
  has_audio: boolean;
  hash: string;
  height: number;
  width: number;
  size: number;
  time_modified: number;
  is_inbox: boolean;
  is_local: boolean;
  is_trashed: boolean;
  known_urls: Array<string>;
  mime: string;
  num_frames: number;
  num_words: number;
  file_services: {
    current: {
      key: string;
      time_imported: number;
    };
    deleted: {};
  };
  tags: {
    [key: string]: MetadataTag;
  };
};

type MetadataTag = {
  display_tags: { [key: number]: Array<string>; };
  name: string;
  storage_tags: { [key: number]: Array<string>; };
  type: number;
  type_pretty: string;
}


export type TagRepositoryTuple = {
  name:string;
  service_key:string;
  type:number;
  type_pretty:string;
}

export type APIResponseGetService = {
  all_known_files:Array<TagRepositoryTuple>;
  all_known_tags:Array<TagRepositoryTuple>;
  all_local_files:Array<TagRepositoryTuple>;
  all_local_media:Array<TagRepositoryTuple>;
  file_repositories:Array<TagRepositoryTuple>;
  local_files:Array<TagRepositoryTuple>;
  local_tags:Array<TagRepositoryTuple>;
  local_updates:Array<TagRepositoryTuple>;
  tag_repositories:Array<TagRepositoryTuple>;
  trash:Array<TagRepositoryTuple>;
}
