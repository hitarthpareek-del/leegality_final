const axios = require("axios");

function createLeegalityClient(company) {
  return axios.create({
    baseURL: process.env.LEEGALITY_BASE_URL,
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