
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor'

const axios = setupCache(Axios)

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
  const API_TARGET = 32
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

export async function api_get_services() {
  axios.get(server_address + '/get_services', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response) {
      //console.log(response.data['all_known_tags'][0].service_key)
      sessionStorage.setItem('hydrus-all-known-tags', response.data['all_known_tags'][0].service_key)
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
  tag_service_key: string;
  tag_service_name: string;
}
export async function api_add_tags_search_tags(props: ApiSearchTagsProps) {
  return axios.get(server_address + '/add_tags/search_tags', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "search": props.search,
      "tag_service_key": props.tag_service_key,
      "tag_service_name": props.tag_service_name
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
  return_hashes: boolean
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
export function enumToArray(enumerator:{ [s: number]: string }):Array<string> {
  //@ts-ignore
  return Object.keys(enumerator).filter((key) => !isNaN(Number(enumerator[key])))
}

export async function api_get_files_search_files(props: APISearchFilesProps) {
  let sentTags:Array<Array<string>|string> = []
  if (localStorage.getItem('hydrus-max-results') != undefined) {
    sentTags = props.tags.slice()
    if (Array.isArray(sentTags[0]) || sentTags.length === 0) { sentTags.push('system:limit=' + localStorage.getItem('hydrus-max-results')) }

  }
  else {
    sentTags = props.tags.slice()
    sentTags.push('system:limit=5000')
  }
  
  return axios.get(server_address + '/get_files/search_files', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "tags": JSON.stringify(sentTags),
      "file_service_name": JSON.stringify(props.file_service_name),
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

  //Something thats I will find stupid in the future
  //Makes sure that sessionKey is string type
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

  //Something thats I will find stupid in the future
  //Makes sure that sessionKey is string type
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

interface APIGetFileMetadataProps {
  file_id?: number;
  file_ids?: Array<number>;
  hash?: string;
  hashes?: Array<string>;
  hide_service_names_tags?: boolean;
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
  service_keys_to_statuses_to_display_tags: {
    [key: string]: Array<Array<string>>
  };
  service_keys_to_statuses_to_tags: {
    [key: string]: Array<Array<string>>
  }
}



export async function api_get_file_metadata(props: APIGetFileMetadataProps) {
  if (!props.file_id && !props.file_ids && !props.hash && !props.hashes) { return }
  return axios.get(server_address + '/get_files/file_metadata', {
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
      'hide_service_names_tags': props.hide_service_names_tags
    }
  })
}
