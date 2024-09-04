const multer = require('multer');
import * as path from 'path'

// import * as multer from 'multer'

import * as fs from 'fs';
const storage = multer.diskStorage({


    destination: function (req, file, cb) {
        // console.log("aaaaa");
        
    //   console.log("file2 => ", file);
        var date = Date.now()
        

        var dir = `uploads/${date}/`;
        var updir = path.join(__dirname, '../uploads');
        // console.log("Resolved upload directory: ", updir);

        if (!fs.existsSync(updir)) {
            fs.mkdirSync(updir);
        }
        // if (!fs.existsSync(updir)) {
        //     fs.mkdirSync(updir);
        // }
        cb(null, updir);
    },
    filename: function (req, file, cb) {
        
        cb(null, makeid(7) + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'application/pdf' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ) {
        cb(null, true);
    } else {

        cb(null, true);
    }
};

const uploadservice = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50
    },
    fileFilter: fileFilter,

});

const makeid = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + '-';
}


export default uploadservice
