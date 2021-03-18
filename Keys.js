import prodKeys from "./prod.js";
import devKeys from "./dev.js";
let keys;
if (process.env.NODE_ENV == "production") {
  keys = prodKeys;
} else {
  keys = devKeys;
}

export default keys;
