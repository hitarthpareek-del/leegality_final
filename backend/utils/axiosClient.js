const axios = require("axios");
const config = require("../config/envConfig");

function createLeegalityClient(company) {
  return axios.create({
    baseURL: config.leegalityBaseUrl,
    timeout: 30000,
    headers: {
      "X-Auth-Token": company.token,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
}

module.exports = {
  createLeegalityClient,
};