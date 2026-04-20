import * as https from "https";

/**
 * The intel file's export key.
 */
export const EXPORT_KEY = "enums";

/**
 * Fetches JSON data from a url.
 * @param {string} url
 *  The url.
 * @param {Object} options
 *  The request's options.
 * @returns {Promise<Object>}
 *  A Promise that resolves with the JSON data.
 */
export function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, res => {
      let json = "";
      res.on("data", chunk => {
        json += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(json));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}
