
import Axios from 'axios';
import { setupCache } from 'axios-cache-interceptor'

const axios = setupCache(Axios)


const server_address = localStorage.getItem('hydrus-server-address');

export function api_version_clear() {
  sessionStorage.removeItem('hydrus-api-version');
  sessionStorage.removeItem('hydrus-client-version');
}

export async function api_verify_access_key() {
  return axios.get(server_address + '/verify_access_key', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
}

export function api_version() {
  const API_TARGET = 31
  axios.get(server_address + '/api_version', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response) {
      // handle success
      sessionStorage.setItem("hydrus-client-version", response.data.hydrus_version);
      sessionStorage.setItem("hydrus-api-version", response.data.version);
      if (API_TARGET > sessionStorage.getItem("hydrus-api-version") && sessionStorage.getItem('hydrus-api-version-warning-seen') != 1) {
        alert("Connected HYDRUS instance is using lower API version that targeted, please update.")
        sessionStorage.setItem('hydrus-api-version-warning-seen',1)
      }
      if (API_TARGET < sessionStorage.getItem("hydrus-api-version" && sessionStorage.getItem('hydrus-api-version-warning-seen') != 1)) {
        alert("Connected HYDRUS instance is using higher API version that targeted, some thing might not work anymore.")
        sessionStorage.setItem('hydrus-api-version-warning-seen',1)
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

export async function api_get_services() {
  console.log('Grabbing all-tags service key')
  axios.get(server_address + '/get_services', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key")
    }
  })
    .then(function (response) {
      //console.log(response.data['all_known_tags'][0].service_key)
      sessionStorage.setItem('hydrus-all-known-tags',response.data['all_known_tags'][0].service_key)
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

export function sessionKeyRoutine() {
  if (sessionStorage.getItem('hydrus-all-known-tags') == null) {
    api_get_services();
  }

  if (localStorage.getItem('hydrus-api-key') != null && sessionStorage.getItem('hydrus-session-key') == null) {
    api_get_session_key();
  }
}

export function api_get_session_key() {
  axios.get(server_address + '/session_key', {
    params: {
      "Hydrus-Client-API-Access-Key": localStorage.getItem('hydrus-api-key')
    }
  })
    .then(function (response) {
      // handle success
      //console.log(response);
      sessionStorage.setItem("hydrus-session-key", response.data.session_key);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

export async function api_add_tags_search_tags(props) {
  return axios.get(server_address + '/add_tags/search_tags', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "search": props.search,
      "tag_service_key": props.tag_service_key,
      "tag_service_name": props.tag_service_name
    }
  });
}

export async function api_get_clean_tags(search) {
  return axios.get(server_address + '/add_tags/clean_tags', {
    params: {
      "Hydrus-Client-API-Session-Key": sessionStorage.getItem("hydrus-session-key"),
      "tags": JSON.stringify(search)
    }
  });
}

export async function api_get_files_search_files(props) {
  let sentTags
  if (localStorage.getItem('hydrus-max-results') != undefined) {
    //console.log(localStorage.getItem('hydrus-max-results'))
    sentTags = props.tags.slice()
    sentTags.push('system:limit='+localStorage.getItem('hydrus-max-results'))
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

export async function api_get_file(props) {
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
export function api_get_file_address(hash) {
  let server = localStorage.getItem('hydrus-server-address')
  let params = new URLSearchParams({
    "Hydrus-Client-API-Session-Key": sessionStorage.getItem('hydrus-session-key'),
    "hash": hash
  })
  return server + '/get_files/file?' + params
}

//Instead of downloading blob give img or video api file adress
export function api_get_file_thumbnail_address(hash) {
  let server = localStorage.getItem('hydrus-server-address')
  let params = new URLSearchParams({
    "Hydrus-Client-API-Session-Key": sessionStorage.getItem('hydrus-session-key'),
    "hash": hash
  })
  return server + '/get_files/thumbnail?' + params
}


export async function api_get_file_thumbnail(props) {
  //console.log(file_id);
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

export async function api_get_file_metadata(props) {
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
