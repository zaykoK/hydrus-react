
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor'

const axios = setupCache(Axios)

// This is a "fixed" function that won't stop api calls after aborting one
// This will probably get fixed in the future
// I didn't look into what it actually does, so it might be selling your soul to chinese goverment
axios.interceptors.request.use((config) => {
  if (!config.cache) {
    return config;
  }

  async function reject() {
    const key = config.id ?? axios.generateKey(config);

    const storage = await axios.storage.get(key, config);

    // Request cancelled but response is already cached
    if (storage.state === 'cached' || storage.state === 'stale') {
      return;
    }

    await axios.storage.remove(key, config);
  }

  if (config.signal) {
    // Already cancelled request
    if (config.signal.aborted) {
      config.cache = false;
      return config;
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    config.signal.addEventListener('abort', reject);
  }

  // NOTE: Cancel token is DEPRECATED but are here for backward compatibility
  // you can remove this block if you don't use cancel token.
  // https://axios-http.com/docs/cancellation
  if (config.cancelToken) {
    // Already cancelled request
    if (Axios.isCancel(config.cancelToken.reason)) {
      config.cache = false;
      return config;
    }

    void config.cancelToken.promise.then(reject);
  }

  return config;
});

const server_address = localStorage.getItem('hydrus-server-address');

export function api_version_clear() {
  sessionStorage.removeItem('hydrus-api-version');
  sessionStorage.removeItem('hydrus-client-version');
}

export function api_verify_access_key() {
  return axios.get(server_address + '/verify_access_key', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
}

export function api_version() {
  const API_TARGET = 36
  axios.get(server_address + '/api_version', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response) {
      // handle success
      sessionStorage.setItem("hydrus-client-version", response.data.hydrus_version);
      sessionStorage.setItem("hydrus-api-version", response.data.version);

      let warningSeen = sessionStorage.getItem('hydrus-api-version-warning-seen')
      if (!warningSeen) { warningSeen = '0' }

      if (API_TARGET > response.data.version && warningSeen !== '1') {
        alert("Connected HYDRUS instance is using lower API version that targeted, please update.")
        sessionStorage.setItem('hydrus-api-version-warning-seen', '1')
      }
      if (API_TARGET < response.data.version && warningSeen !== '1') {
        alert("Connected HYDRUS instance is using higher API version that targeted, some thing might not work anymore.")
        sessionStorage.setItem('hydrus-api-version-warning-seen', '1')
      }
    })
    .catch(function (error: Error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

export type TagRepositoryTuple = {
  name:string;
  service_key:string;
  type:number;
  type_pretty:string;
}

export type ResponseGetService = {
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

export async function api_get_services() {
  axios.get(server_address + '/get_services', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response) {
      let data:ResponseGetService = response.data
      let stringified = JSON.stringify(data)
      sessionStorage.setItem('hydrus-services', stringified)
    })
    .catch(function (error) {
      // handle error
      console.error(error);
    })
    .then(function () {
      // always executed
    });
}

export async function api_get_session_key() {
  return axios.get(server_address + '/session_key', {
    params: {
      "Hydrus-Client-API-Access-Key": localStorage.getItem('hydrus-api-key')
    }
  })
}

interface ApiSearchTagsProps {
  search: string;
  tag_service_key?: string;
  tag_service_name?: string;
  abortController: AbortController;
  tag_display_type?: string;
}
export async function api_add_tags_search_tags(props: ApiSearchTagsProps) {
  return axios.get(server_address + '/add_tags/search_tags', {
    signal: props.abortController.signal,
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "search": props.search,
      "tag_service_key": props.tag_service_key,
      "tag_service_name": props.tag_service_name,
      "tag_display_type": props.tag_display_type || 'display'
    }
  });
}

export async function api_get_clean_tags(search: string) {
  return axios.get(server_address + '/add_tags/clean_tags', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "tags": JSON.stringify(search)
    }
  });
}

interface APISearchFilesProps {
  tags: Array<Array<string>>;
  file_service_name?: string;
  file_service_key?: string;
  tag_service_name?: string;
  tag_service_key?: string;
  file_sort_type?: FileSortType;
  file_sort_asc?: boolean,
  return_file_ids?: boolean,
  return_hashes: boolean,
  abortController?:AbortController
}

export enum ServiceStatusNumber {
  Current = 0,
  Pending,
  Deleted,
  Petitioned
}

export enum FileSortType {
  FileSize = 0,
  Duration,
  ImportTime,
  Filetype,
  Random,
  Width,
  Height,
  Ratio,
  NumberOfPixels,
  NumberOfTags,
  NumberOfMediaViews,
  TotalMediaViewtime,
  ApproximateBitrate,
  HasAudio,
  ModifiedTime,
  Framerate,
  NumberOfFrames,
  LastViewedTime,
  ArchiveTimestamp,
  HashHex
}

/* Converts enum (like one above) into an array of strings */
export function enumToArray(enumerator: { [s: number]: string }): Array<string> {
  //@ts-ignore
  return Object.keys(enumerator).filter((key) => !isNaN(Number(enumerator[key])))
}

export async function api_get_files_search_files(props: APISearchFilesProps) {
  let sentTags: Array<Array<string> | string> = []
  if (localStorage.getItem('hydrus-max-results') !== null) {
    sentTags = props.tags.slice()
    if (Array.isArray(sentTags[0]) || sentTags.length === 0) { sentTags.push('system:limit=' + localStorage.getItem('hydrus-max-results')) }

  }
  else {
    sentTags = props.tags.slice()
    sentTags.push('system:limit=5000')
  }

  return axios.get(server_address + '/get_files/search_files', {
    signal:props.abortController?.signal,
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "tags": JSON.stringify(sentTags),
      "file_service_name": props.file_service_name || 'my files',
      "file_service_key": JSON.stringify(props.file_service_key),
      "tag_service_name": JSON.stringify(props.tag_service_name),
      "tag_service_key": JSON.stringify(props.tag_service_key),
      "file_sort_type": JSON.stringify(props.file_sort_type),
      "file_sort_asc": JSON.stringify(props.file_sort_asc),
      "return_file_ids": JSON.stringify(props.return_file_ids),
      "return_hashes": JSON.stringify(props.return_hashes)
    }
  });
}

interface APIGetFileProps {
  file_id: number,
  hash: string
}

export async function api_get_file(props: APIGetFileProps) {
  return axios.get(server_address + '/get_files/file', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    },
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "file_id": props.file_id,
      "hash": props.hash
    },
    responseType: 'blob'
  })
}
//Instead of downloading blob give img or video api file adress
export function api_get_file_address(hash: string | undefined) {
  if (!hash) { return }
  let server = localStorage.getItem('hydrus-server-address')

  let sessionKey = sessionStorage.getItem('hydrus-session-key')
  if (!sessionKey) { sessionKey = '' }

  let params = new URLSearchParams({
    "Hydrus-Client-API-Session-Key": sessionKey,
    "hash": hash
  })
  return server + '/get_files/file?' + params
}

//Instead of downloading blob give img or video api file adress
export function api_get_file_thumbnail_address(hash: string | undefined) {
  if (!hash) { return }
  let server = localStorage.getItem('hydrus-server-address')

  let sessionKey = sessionStorage.getItem('hydrus-session-key')
  if (!sessionKey) { sessionKey = '' }

  let params = new URLSearchParams({
    "Hydrus-Client-API-Session-Key": sessionKey,
    "hash": hash
  })
  return server + '/get_files/thumbnail?' + params
}

interface APIGetFileThumbnailProps {
  file_id?: number;
  hash?: string;
}

export async function api_get_file_thumbnail(props: APIGetFileThumbnailProps) {
  return axios.get(server_address + '/get_files/thumbnail', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    },
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "file_id": props.file_id,
      "hash": props.hash
    },
    responseType: 'blob'
  })
}

export type MetadataResponse = {
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
    }
    deleted: {}
  }
  tags: {[key:string]: {
    display_tags:{[key:number]:Array<string>};
    name:string;
    storage_tags:{[key:number]:Array<string>};
    type:number;
    type_pretty:string;
  }}
}

interface APIGetFileMetadataProps {
  file_id?: number;
  file_ids?: Array<number>;
  hash?: string;
  hashes?: Array<string>;
  create_new_file_ids?: boolean;
  only_return_identifiers?: boolean;
  only_return_basic_information?: boolean;
  detailed_url_information?: boolean;
  include_notes?: boolean;
  abortController?: AbortController;
}

export async function api_get_file_metadata(props: APIGetFileMetadataProps) {
  if (!props.file_id && !props.file_ids && !props.hash && !props.hashes) { return }
  return axios.get(server_address + '/get_files/file_metadata', {
    signal: props.abortController?.signal,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    },
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "file_id": props.file_id,
      "file_ids": JSON.stringify(props.file_ids),
      "hash": props.hash,
      "hashes": JSON.stringify(props.hashes),
      'create_new_file_ids': props.create_new_file_ids,
      'only_return_identifiers': props.only_return_identifiers,
      'only_return_basic_information': props.only_return_basic_information,
      'detailed_url_information': props.detailed_url_information,
      'include_notes': props.include_notes,
      'hide_service_keys_tags':JSON.stringify(false), /* This should be removed some time soon after hydrus removes this */
      'hide_service_names_tags':JSON.stringify(true),
    }
  })
}
/*** This return a tag array from metadata object
 * 
 */
export function getTagsFromMetadata(metadata:MetadataResponse,key:string,servicesData:ResponseGetService|null):Map<string,Array<string>> {
  // Load services data
  let tagsByService:Map<string,Array<string>> = new Map()

  let blacklist = localStorage.getItem('tag-services-blacklist')

  // For now I load every tag service tag
  // This should later be changed to only load enabled ones
  if (servicesData === null) {return new Map()}

  tagsByService.set(servicesData.all_known_tags[0].service_key,metadata.tags[servicesData.all_known_tags[0].service_key].display_tags[0])

  for (let element of servicesData.local_tags) {
    tagsByService.set(element.service_key,metadata.tags[element.service_key].display_tags[0] || [])
  }
  return tagsByService
}
