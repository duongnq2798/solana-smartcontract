"use strict";
(() => {
var exports = {};
exports.id = 39;
exports.ids = [39];
exports.modules = {

/***/ 7766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: external "axios"
const external_axios_namespaceObject = require("axios");
var external_axios_default = /*#__PURE__*/__webpack_require__.n(external_axios_namespaceObject);
;// CONCATENATED MODULE: ./pages/api/upload.ts
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const image_api_key = process.env.REACT_APP_IMAGE_BB;
const uploadImage = async (image, expires)=>{
    const params = new URLSearchParams();
    params.append("image", image);
    const response = await external_axios_default().post(`https://api.imgbb.com/1/upload?expiration=${expires}&key=${image_api_key}`, params);
    return response.data.data.url;
};
async function handler(req, res) {
    const image = JSON.parse(req.body).image;
    console.log(image);
    if (image.length < 20) return res.status(400).json("Invalid Image");
    const url = await uploadImage(image, "259200");
    res.status(200).json(url);
};


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(7766));
module.exports = __webpack_exports__;

})();