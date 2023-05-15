
import Axios, { AxiosError, AxiosResponse } from 'axios';
//@ts-ignore
import { AxiosCacheInstance, CacheAxiosResponse, setupCache } from 'axios-cache-interceptor'
import { APIResponseGetService, APIResponseMetadata, APIResponseSearch, MetadataResponse } from './MetadataResponse';

const axios = setupCache(Axios)

// Hydrus API version target
const API_TARGET = 44
// Flag for custom changed build of hydrus with additional settings for api calls
const HYDRUS_API_EXTEND = JSON.parse(localStorage.getItem('hydrus-extended-api')||'false');

const server_address = localStorage.getItem('hydrus-server-address');
const session_key = sessionStorage.getItem('hydrus-session-key');

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
  axios.get(server_address + '/api_version', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response: AxiosResponse) {
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

export async function api_get_services() {
  axios.get(server_address + '/get_services', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response: AxiosResponse) {
      let data: APIResponseGetService = response.data
      let stringified = JSON.stringify(data)
      sessionStorage.setItem('hydrus-services', stringified)
    })
    .catch(function (error: AxiosError) {
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
  tags: Array<Array<string> | string> | Array<string>;
  file_service_name?: string;
  file_service_key?: string;
  tag_service_name?: string;
  tag_service_key?: string;
  file_sort_type?: FileSortType;
  file_sort_asc?: boolean,
  return_file_ids?: boolean,
  return_hashes: boolean,
  abortController?: AbortController
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

export async function api_get_files_search_files(props: APISearchFilesProps): Promise<CacheAxiosResponse<APIResponseSearch> | undefined> {
  let sentTags: Array<Array<string> | string> = []

  if (localStorage.getItem('hydrus-max-results') !== null) {
    let hasLimit = false
    sentTags = props.tags.slice()
    for (let element of sentTags.flat()) {
      if (element.includes('system:limit=')) {
        hasLimit = true;
        break;
      }
    }
    if (!hasLimit && (Array.isArray(sentTags[0]) || sentTags.length === 0)) { sentTags.push('system:limit=' + localStorage.getItem('hydrus-max-results')) }

  }
  else {
    sentTags = props.tags.slice()
    sentTags.push('system:limit=5000')
  }

  return axios.get(server_address + '/get_files/search_files', {
    signal: props.abortController?.signal,
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
  let server = server_address

  let sessionKey = session_key
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
  let server = server_address
  let sessionKey = session_key

  if (!sessionKey) { sessionKey = '' }

  let params = new URLSearchParams({
    "Hydrus-Client-API-Session-Key": sessionKey,
    "hash": hash
  })
  return server + '/get_files/thumbnail?' + params
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
  tags?: Array<string>;
  only_file_tags?: boolean;
  tag_services?: Array<string>;
}

type MetadataParams = {
  "Hydrus-Client-API-Session-Key": string|null;
  "file_id"?: number|undefined;
  "file_ids"?: string|undefined;
  "hash"?: string|undefined;
  "hashes"?: string|undefined;
  'create_new_file_ids'?: boolean|undefined;
  'only_return_identifiers'?: boolean|undefined;
  'only_return_basic_information'?: boolean|undefined;
  'detailed_url_information'?: boolean|undefined;
  'include_notes'?: boolean|undefined;
  'tags'?: string|undefined;
  'only_file_tags'?: boolean|undefined;
  'service_name'?: string|undefined;
}



export async function api_get_file_metadata(props: APIGetFileMetadataProps): Promise<CacheAxiosResponse<APIResponseMetadata> | undefined> {
  if (!props.file_id && !props.file_ids && !props.hash && !props.hashes) { return }

  let params:MetadataParams = {
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
    //'hide_service_keys_tags':JSON.stringify(false), /* This should be removed some time soon after hydrus removes this */
    //'hide_service_names_tags':JSON.stringify(true),
  }
  // What happens here is if flag is true, add extended parameters to the api call
  // This should leave normal calls unchanged
  if (HYDRUS_API_EXTEND) {
    params = {
      ...params,
      'tags': JSON.stringify(props.tags),
      'only_file_tags': props.only_file_tags,
      "service_name": JSON.stringify(props.tag_services)
    }
  }



  return axios.get(server_address + '/get_files/file_metadata', {
    signal: props.abortController?.signal,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    },
    params: params
  })
}
/*** This return a tag array from metadata object
 * 
 */
export function getTagsFromMetadata(metadata: MetadataResponse, key: string, servicesData: APIResponseGetService | null): Map<string, Array<string>> {
  // Load services data
  let tagsByService: Map<string, Array<string>> = new Map()

  let blacklist = localStorage.getItem('tag-services-blacklist')

  // For now I load every tag service tag
  // This should later be changed to only load enabled ones
  if (servicesData === null) { return new Map() }

  tagsByService.set(servicesData.all_known_tags[0].service_key, metadata.tags[servicesData.all_known_tags[0].service_key]?.display_tags[0] || [])

  for (let element of servicesData.local_tags) {
    tagsByService.set(element.service_key, metadata.tags[element.service_key]?.display_tags[0] || [])
  }
  return tagsByService
}

/* RELATIONS RELATED FUNCTIONS */
interface FileRelationshipProps {
  file_id?: number;
  file_ids?: number[];
  hash?: string;
  hashes?: string[];
  abortController?: AbortController;
}

export type FileRelationshipResponse = {
  [key: string]: {
    is_king: boolean | null;
    king: string;
    '0': string[]; //Potential duplicates
    '1': string[]; //False positives
    '3': string[]; //alternates
    '8': string[]; //duplicates
  }
}

export async function api_get_file_relationships(props: FileRelationshipProps) {
  if (props.file_id === undefined && props.file_ids === undefined && props.hash === undefined && props.hashes === undefined) { return }
  return axios.get(server_address + '/manage_file_relationships/get_file_relationships', {
    signal: props.abortController?.signal,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    },
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"), //This might be bad for performance, need to check this on some functions (thumbnails especiialy)
      "file_id": props.file_id,
      "file_ids": JSON.stringify(props.file_ids),
      "hash": props.hash,
      "hashes": JSON.stringify(props.hashes)
    }
  })
}

// Wrapper functions

interface getAllTagsProps {
  namespace: string;
  abortController: AbortController;
}
export type APITagResponse = {
  value: string;
  count: number;
}

export async function getAllTags(props: getAllTagsProps) {
  //Do the search
  let response = await api_add_tags_search_tags({
    search: `${props.namespace}:*`,
    abortController: props.abortController
  })
  let tagArray: Array<APITagResponse> = response.data.tags
  let finalArray: Array<APITagResponse> = []
  //Get rid of duplicates and cases where searched namespace of tag is sibling of of something else ex. creator:naruto > series:naruto
  tagArray.map((element: APITagResponse, count: number) => {
    if (element.value.includes(props.namespace)) {
      finalArray.push(element)
    }
  })
  return finalArray
}