export const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "dev.mytender.io:7861";
export const HTTP_PREFIX = import.meta.env.VITE_REACT_APP_API_URL_PREFIX_HTTPS
  ? ""
  : "s";

export const placeholder_upload = `
Paste bid material here...
    `;
export const OKTA_DOMAIN = import.meta.env.VITE_APP_OKTA_DOMAIN;
export const OKTA_CLIENT_ID = import.meta.env.VITE_APP_OKTA_CLIENT_ID;

