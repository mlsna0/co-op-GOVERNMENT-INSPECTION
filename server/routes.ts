import * as express from 'express';


import RecordModelCtrl from './controller/recordController';
import UserModelCtrl from './controller/userController';
import ViewModelCtrl from './controller/viewController';
import RegisterModelCtrl from './controller/registerController';
import uploadservice from './service/uploadservice.service';
import timeStampModelCtrl from './controller/timeStampController';
import auth from './middleware/auth/auth'
import path from 'path';


const { PDFDocument } = require('pdf-lib')
const fs = require('fs')
const multer = require('multer')
const upload = multer()

const { plainAddPlaceholder } = require('node-signpdf/dist/helpers')
// import SignPdf from 'node-signpdf';
const forge = require('node-forge');




// import PdfCtrl from './controller/pdfController';
// import DetailModelCtrl from 'controller/detailController';
// import AggRecordNViewCon from 'controller/aggRecordNviewController'; //petch edit add this

function setRoutes(app): void {
  const router = express.Router();

  const recordModelCtrl = new RecordModelCtrl();
  const userModelCtrl = new UserModelCtrl();
  const viewModelCtrl = new ViewModelCtrl();
  const registerModelCtrl = new RegisterModelCtrl();
  const timestampModelCtrl = new timeStampModelCtrl();

  router.route('/record/savepdf').put(recordModelCtrl.savePDF);
  router.route('/pdf/:id').get(recordModelCtrl.getPDF);
  router.route('/data').get(recordModelCtrl.getData);
  // router.route('/pdf').get(itemModelCtrl.getPDF);

  router.route('/record/updateContent').put(recordModelCtrl.updateRecordContent);
  // router.route('/record/updatePDF').put(itemModelCtrl.updateRecordPDF);

  router.route('/postItemData').post(recordModelCtrl.auth, recordModelCtrl.postItemToView);
  router.route('/postTyproText').post(recordModelCtrl.postItemToView);
  // router.route('/postAddDetail').post(itemModelCtrl.addDetail);
  router.route('/postDataTest').post(recordModelCtrl.auth,uploadservice.none(),recordModelCtrl.postItemToView)
  // router.route('/postDataTest').post(uploadservice.none(), auth.authorize, recordModelCtrl.postItemToView);
 

  // RecordModel routes
  router.route('/recordModel').get(recordModelCtrl.getAll);
  router.route('/recordModel/count').get(recordModelCtrl.count);
  router.route('/recordModel').post(recordModelCtrl.insert);
  router.route('/recordModel/:id').get(recordModelCtrl.get);
  router.route('/recordModel/:id').put(recordModelCtrl.update);
  router.route('/recordModel/:id').delete(recordModelCtrl.delete);

  router.route('/viewModel/getViewByRecordId/:id').get(viewModelCtrl.getViewByRecordId);
  /////report crate

  router.route('/getall').get(recordModelCtrl.getAllRecordsRenamed);
  router.route('/timeStampLogin').get(timestampModelCtrl.getTimeLogin);
  router.route('/recordModel/getuser/:userId').get(recordModelCtrl.getRecordWithUserAndEmployee);

  // UserModel routes
  router.route('/timeStampModel').get(userModelCtrl.getAll);
  router.route('/timeStampModel/count').get(userModelCtrl.count);
  router.route('/timeStampModel').post(userModelCtrl.insert);
  router.route('/timeStampModel/:id').get(userModelCtrl.get);
  router.route('/timeStampModel/:id').put(userModelCtrl.update);
  router.route('/timeStampModel/:id').delete(userModelCtrl.delete);
  
  // router.route('/timeStampModel').get(userModelCtrl.getTimeLogin);

  //TimeStampModel routes
  router.route('/userModel').get(timestampModelCtrl.getAll);
  router.route('/userModel/count').get(timestampModelCtrl.count);
  router.route('/userModel').post(timestampModelCtrl.insert);
  router.route('/userModel/:id').get(timestampModelCtrl.get);
  router.route('/userModel/:id').put(timestampModelCtrl.update);
  router.route('/userModel/:id').delete(timestampModelCtrl.delete);

  

  // ViewModel routes
  router.route('/viewModel').get(viewModelCtrl.getAll);
  router.route('/viewModel/count').get(viewModelCtrl.count);
  router.route('/viewModel').post(viewModelCtrl.insert);
  router.route('/viewModel/:id').get(viewModelCtrl.get);
  router.route('/viewModel/:id').put(viewModelCtrl.update);
  router.route('/viewModel/:id').delete(viewModelCtrl.delete);

  router.route('/registerModel').get(registerModelCtrl.getAll);
  router.route('/registerModel/profile').get(auth.authorize, registerModelCtrl.getUserProfile);//petch add
  
  router.route('/registerModel/count').get(registerModelCtrl.count);
  router.route('/registerModel').post(uploadservice.single('profileImage'), registerModelCtrl.create);
  
  router.route('/registerModel/login').post(registerModelCtrl.login); // Ensure authorize middleware is used
  router.route('/registerModel/resetPassword').put(auth.authorize, registerModelCtrl.resetPassword);
  router.route('/registerModel/forgotPassword').post(registerModelCtrl.forgotPassword); 
  router.route('/registerModel/:id').get(registerModelCtrl.get);
  router.route('/registerModel/:id').put(registerModelCtrl.update);
  router.route('/registerModel/:id').delete(registerModelCtrl.delete);
  // router.route('/getEmp').get(registerModelCtrl.getEmp); 
  router.route('/allUsers').get(registerModelCtrl.getAllUsers); 
  router.route('/user').get(registerModelCtrl.getUsers);

  // router.route('/user/:id').put(registerModelCtrl.updateUserDetails);
  router.route('/userModel/getUserById/:id').get(userModelCtrl.getUserById);
  router.route('/userModel/updateUserById/:id').put(uploadservice.single('profileImage'),userModelCtrl.updateUserById);
  router.route('/userModel/resetPassword').put(userModelCtrl.updateUserById);
                                                    //,
  router.route('/registerModel/updateProfile').put( auth.authorize,registerModelCtrl.updateEmployeeProfile);
  router.route('/registerModel/updateRole/:id').put(registerModelCtrl.updateUserRole);
  router.route('/registerModel/uploadProfile')
    .put(auth.authorize, uploadservice.single('profile'), registerModelCtrl.uploadProfile);
  //agg $lookup Record and View model routes //petch edit add this
  // router.route('/aggRecordNview/:id').get(AggRecordNViewCon.get);


    // Signature
    router.route('/stampSignature').post(upload.fields([{ name: "pdfFile" }]), async (req: any, res, next) => {
        try {
            console.log("00000000 =>");
            const pdfload = await PDFDocument.load(req.files['pdfFile'][0].buffer)
            const pdfDoc = await PDFDocument.create();
            let signBase64Trim = req.body.base64.replace('data:image/png;base64,', '')
            const buffer = Buffer.from(signBase64Trim, "base64");
            const signImage = await pdfDoc.embedPng(buffer);
            let signData = JSON.parse(req.body.signData);
            for (let index = 0; index < pdfload.getPageCount(); index++) {
                let signPosition = signData.filter(
                    (res) => {
                        return res.page == index + 1;
                    }
                );

                if (signPosition) {
                    const [signCopyPage] = await pdfDoc.copyPages(pdfload, [
                        index,
                    ]);
                    const page = pdfDoc.addPage(signCopyPage);
                    signPosition.forEach((element) => {
                        const { width, height } = page.getSize();
                        let signSize = element.signSize;
                        console.log('signSize: ', signSize);
                        let imgWidth =
                            (+signSize.x1 * width) / 100 - (+signSize.x2 * width) / 100;
                        let imgHeight =
                            (+signSize.y1 * height) / 100 - (+signSize.y2 * height) / 100;
                        let offsetX = imgWidth / 2;
                        let offsetY = imgHeight / 2;
                        console.log('offsetX: ', offsetX);
                        console.log('offsetY: ', offsetY);

                        // let x = element.position_percentage.x - offsetX; //- center.x;
                        // let y = element.position_percentage.y - offsetY; //- center.y
                        let x = ((width * element.position_percentage.x) / 100) - offsetX//- center.x;
                        let y = ((height * element.position_percentage.y) / 100) - offsetY//- center.y
                        console.log('x: ', x);
                        console.log('y: ', y);

                        page.drawImage(signImage, {
                            x: x,
                            y: y,
                            width: imgWidth,
                            height: imgHeight,
                            opacity: 1,
                        });
                    });
                } else {
                    const [firstDonorPage] = await pdfDoc.copyPages(pdfload, [
                        index,
                    ]);
                    pdfDoc.insertPage(index, firstDonorPage);
                }
            }
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

            if (req.body.type == 'ca') {
                let CA = fs.readFileSync('D:/data/OrganizationWebupload/ca_files/' + req.body.user_ca + '.p12');

                const p12Data = CA.toString('base64')
                const p12Der = forge.util.decode64(p12Data);
                const p12Asn1 = forge.asn1.fromDer(p12Der, { parseAllBytes: false });   
                const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, req.body.caPass);
                const certificate = p12.getBags({ bagType: forge.pki.oids.certBag });

                const now = new Date();

                if (now > certificate[forge.pki.oids.certBag][0].cert.validity.notAfter) {
                    return res.json({ status: false, message: ' CA หมดอายุ' });
                }
                let pdfBuffer = await plainAddPlaceholder({
                    pdfBuffer: Buffer.from(pdfBytes),
                    reason: '',
                    contactInfo: '',
                    signatureLength: 16384,
                    name: '',
                    location: '',
                });

                // pdfBuffer = await SignPdf.sign(pdfBuffer, CA, {
                //     passphrase: req.body.caPass,
                // });

                fs.writeFileSync('D:/data/OrganizationWebupload/signatured_documents/' + req.body.oca + req.body.requestId + req.body.userId + '.pdf',
                    pdfBuffer,
                    'binary'
                );
                return res.json('https://doc.oca.go.th/signatured_documents/' + req.body.oca + req.body.requestId + req.body.userId + '.pdf')
            }
            console.log("1111111 =>",req.body.type);
            
            // fs.writeFileSync('D:/data/OrganizationWebupload/signatured_documents/' + req.body.oca + req.body.requestId + req.body.userId + '.pdf',
            //     pdfBytes,
            //     'binary'
            // );


            //เป็นการเลือกที่ ที่จะเก็บ ไฟล์ลงไป ว่าจะเก็บไว้ที่ไหน
            
            fs.writeFileSync('L:/projectNT/angualr-project-training/dist/server/singature/'+ req.body.oca + req.body.userId + '.pdf',
                pdfBytes,
                'binary'
            );
            console.log("222222222 =>");
            console.log('oca:', req.body.oca);
            console.log('userId:', req.body.userId);

            //ถ้าใช้เเบบนี้ จะมีการดึงข้อมูลเเบบรูปโปรไฟล์
            // return res.json(true)

            //หรือ จะดึงมาใช้เเบบนี้ก็ได้
            return res.json('http://localhost:3000/api/stampSignature/ ' + req.body.oca + req.body.requestId + req.body.userId + '.pdf')
        } catch (err) {
            if (err.message == 'PKCS#12 MAC could not be verified. Invalid password?') {
                console.log("Wrong Password =>");
                return res.status(200).json({ status: false, message: ' รหัสผ่าน CA ไม่ถูกต้อง' });
            } else {
                console.log("error =>", err.message);
                return res.status(500).json({ error: err.message });
            }
        }
    })

    router.route('/test').get(async (req, res: any) => {
        let CAFile = fs.readFileSync('C:/Users/Administrator/Desktop/oca/dist/oca/test.p12')
        console.log(CAFile)
        return res.status(200).send('test')
    })
    app.use('/api', router);
}

export default setRoutes;

