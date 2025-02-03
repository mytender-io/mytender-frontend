import Axios from "axios";

const axios = Axios.create();
axios.interceptors.response.use((response) => {
  if (response.status === 401) {
    location.href = "/";
  }

  return response;
});

export default axios;
