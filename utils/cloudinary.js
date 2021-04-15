import cloudinary from "cloudinary";

import keys from "../Keys.js";
let { cloud_name, cloud_api_key, cloud_api_secret } = keys;
cloudinary.config({
  cloud_name: cloud_name,
  api_key: cloud_api_key,
  api_secret: cloud_api_secret,
});
export default cloudinary;
