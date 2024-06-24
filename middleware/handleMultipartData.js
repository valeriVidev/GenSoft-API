const customErrs = require("../customErrors/customErrors.js")

const path = require('path')
const multer = require('multer')
let imgArray = []
let count = 1
const allowedFormats = [
  'image/png',
  'image/jpg', 
  'image/jpeg', 
  'video/mp4'
]
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) => {

    let new_file_name = Date.now() + "_" + count + path.extname(file.originalname);
    const full_path = __filename;
    const dirPath = "http://localhost:8000/"//full_path.split('middleware')[0];
    let dest_folder = "uploads/"
    const imgPath = dirPath + dest_folder + new_file_name;
    if (file.fieldname === "head_image") {
      new_file_name = "head_" + new_file_name;
      req.head_img = dirPath + dest_folder + new_file_name;
    }
    else if (file.fieldname === "support_images") {
      if(imgArray.length == 0 && req.support_img === undefined){
        imgArray.push(imgPath);
        req.support_img = imgArray;
        count += 1
      }
      else if (imgArray.length > 0 && req.support_img !== undefined){
        req.support_img.push(imgPath);
        count += 1
      }
      else if (imgArray.length > 0 && req.support_img === undefined){
        imgArray = []
        count = 1
        imgArray.push(imgPath)
        req.support_img = imgArray;
      }
    }
    cb(null, new_file_name)
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname != 'support_images' && file.fieldname != 'head_image') {
      let source = req.baseUrl
      source = source.split('/')
      source = source[source.length - 1]
      source = source[0].toUpperCase() + source.substring(1, source.length)
      req.source = source
      return cb(new customErrs.IncorrectParamError('Incorrect image variable.'))
    }
    else if (!allowedFormats.includes(file.mimetype)) {
      return cb(new customErrs.IncorrectParamError('Only images are allowed.'))
    }
    cb(null, true)
  },
  limits:{
      fileSize: 1024 * 1024 * 3 // 1mb multiplied by 3
  }
})

module.exports = upload
