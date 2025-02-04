import * as express from 'express';


import RecordModelCtrl from './controller/recordController';
import UserModelCtrl from './controller/userController';
import ViewModelCtrl from './controller/viewController';
import RegisterModelCtrl from './controller/registerController';
import uploadService from './service/uploadservice.service';

import timeStampModelCtrl from './controller/timeStampController';
import AgencyModelCtrl from './controller/agencyController';
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
  const agencyModelCtrl = new AgencyModelCtrl();

  router.route('/record/savepdf').put(recordModelCtrl.savePDF);
  router.route('/pdf/:id').get(recordModelCtrl.getPDF);
  router.route('/data').get(recordModelCtrl.getData);
  // router.route('/pdf').get(itemModelCtrl.getPDF);

  router.route('/record/updateContent').put(recordModelCtrl.updateRecordContent);
  // router.route('/record/updatePDF').put(itemModelCtrl.updateRecordPDF);

  router.route('/postItemData').post(recordModelCtrl.auth, recordModelCtrl.postItemToView);
  router.route('/postTyproText').post(recordModelCtrl.postItemToView);
  // router.route('/postAddDetail').post(itemModelCtrl.addDetail);
  router.route('/updateDataDocument/:id').put(recordModelCtrl.updateDataDocument)
  router.route('/postDataTest').post(recordModelCtrl.auth,uploadService.none(),recordModelCtrl.postItemToView)
  // router.route('/postDataTest').post(uploadservice.none(), auth.authorize, recordModelCtrl.postItemToView);
 

  // RecordModel routes
  router.route('/pdfs').get(recordModelCtrl.getAllPDFs);
  router.route('/recordModel').get(recordModelCtrl.getAll);
  router.route('/recordModel/getAllRecordsWithEmployees').get(recordModelCtrl.getAllRecordsWithEmployees); //ทดลอง
  router.route('/recordModel/count').get(recordModelCtrl.count);
  router.route('/recordModel').post(recordModelCtrl.insert);
  router.route('/recordModel/:id').get(recordModelCtrl.get);
  router.route('/recordModel/:id').put(recordModelCtrl.update);
  router.route('/recordModel/:id').delete(recordModelCtrl.delete);
  router.route('/recordModel/updateStatusDocument/:id').put(recordModelCtrl.updateStatus);
  router.route('/recordModel/getRecordWithSameOrganization/:id').get(recordModelCtrl.getRecordWithSameOrganization);
  router.route('/user/documents').get(auth.authorize, recordModelCtrl.getUserDocuments);
  
  router.route('/viewModel/getViewByRecordId/:id').get(viewModelCtrl.getViewByRecordId);
  /////report crate


  router.route('/documents/:id').get(recordModelCtrl.getRecordByDocumentId);
  router.route('/getall').get(recordModelCtrl.getAllRecordsLinkedByEmployeeId);
  router.route('/timeStampLogin').get(timestampModelCtrl.getTimeLogin);
  router.route('/recordModel/getuser/:userId').get(recordModelCtrl.getRecordWithUserAndEmployee);

  // UserModel routes
  router.route('/userModel/resetPassword').put(auth.authorize, userModelCtrl.resetPassword);
  router.route('/userModel').get(userModelCtrl.getAll);
  router.route('/userModel/count').get(userModelCtrl.count);
  router.route('/userModel').post(userModelCtrl.insert);
  router.route('/userModel/:id').get(userModelCtrl.get);
  router.route('/userModel/:id').put(userModelCtrl.update);
  router.route('/userModel/:id').delete(userModelCtrl.delete);
  
  // router.route('/timeStampModel').get(userModelCtrl.getTimeLogin);

  //TimeStampModel routes
  router.route('/timeStampModel').get(timestampModelCtrl.getAll);
  router.route('/timeStampModel/count').get(timestampModelCtrl.count);
  router.route('/timeStampModel').post(timestampModelCtrl.insert);
  router.route('/timeStampModel/:id').get(timestampModelCtrl.get);
  router.route('/timeStampModel/:id').put(timestampModelCtrl.update);
  router.route('/timeStampModel/:id').delete(timestampModelCtrl.delete);


  router.route('/agencyModel').get(agencyModelCtrl.getAll);
  router.route('/createagency').post(agencyModelCtrl.createAgency);
//   router.route('/createagency').post(timestampModelCtrl.insert);
  router.route('/getAgencies').get(agencyModelCtrl.getAgencies);
//   router.route('/agencyModel').post(agencyModelCtrl.insert);
  router.route('/getAgencyById').get(agencyModelCtrl.getAgencyById);
  router.route('/agencyModel/UpdateOrganizationById/:id').put(agencyModelCtrl.update);
  router.route('/agencyModel/:id').delete(agencyModelCtrl.delete);

  // ViewModel routes
  router.route('/viewModel').get(viewModelCtrl.getAll);
  router.route('/viewModel/count').get(viewModelCtrl.count);
  router.route('/viewModel').post(viewModelCtrl.insert);
  router.route('/viewModel/:id').get(viewModelCtrl.get);
  router.route('/viewModel/:id').put(viewModelCtrl.update);
  router.route('/viewModel/:id').delete(viewModelCtrl.delete);
  // ตั้งค่าให้บริการไฟล์ลายเซ็น
  router.use('/signaturesDetail', express.static(path.join(__dirname, 'signaturesDetail')));
  router.route('/viewModel/saveSignature/:documentId').post(viewModelCtrl.saveSignatureToFile);
 

  router.route('/registerModel').get(registerModelCtrl.getAll);
  router.route('/registerModel/profile').get(auth.authorize, registerModelCtrl.getUserProfile);//petch add
  router.route('/registerModel/getOrganizationById/:id').get(registerModelCtrl.getOrganizationById);//petch add
  router.route('/registerModel/getPersonsWithSameOrganization/:id').get(registerModelCtrl.getPersonsWithSameOrganization);//petch add
  router.route('/registerModel/count').get(registerModelCtrl.count);
  router.route('/registerModel').post(uploadService.single('profileImage'), registerModelCtrl.create);
  
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
  router.route('/userModel/updateUserById/:id').put(uploadService.single('profileImage'),userModelCtrl.updateUserById);
  router.route('/userModel/resetPassword/:id').put(userModelCtrl.resetPassword);//รอแก้ไข
  
  router.route('/userModel/resetPassword').put(userModelCtrl.updateUserById);
  router.route('/userModel/updateUserStatus/:userId').put(userModelCtrl.updateUserStatus);
                                                    //,
  router.route('/registerModel/updateProfile').put( auth.authorize,registerModelCtrl.updateEmployeeProfile);
  router.route('/registerModel/updateRole/:id').put(registerModelCtrl.updateUserRole);
  router.route('/registerModel/uploadProfile')
    .put(auth.authorize, uploadService.single('profile'), registerModelCtrl.uploadProfile);
  //agg $lookup Record and View model routes //petch edit add this
  // router.route('/aggRecordNview/:id').get(AggRecordNViewCon.get);


    // Signature
    router.route('/stampSignature').post(upload.fields([{ name: "pdfFile" }]), async (req: any, res, next) => {
        try {
            console.log("00000000 => Started processing PDF file upload");
    
            // Load PDF file
            const pdfload = await PDFDocument.load(req.files['pdfFile'][0].buffer);
            console.log("Loaded PDF file");
    
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            console.log("Created a new PDF document");
    
            // Process base64 signature
            let signBase64Trim = req.body.base64.replace('data:image/png;base64,', '');
            const buffer = Buffer.from(signBase64Trim, "base64");
            const signImage = await pdfDoc.embedPng(buffer);
            console.log("Embedded signature image");
    
            let signData = JSON.parse(req.body.signData);
            console.log("Parsed sign data", signData);
    
            // Loop through each page of the PDF and apply the signature
            for (let index = 0; index < pdfload.getPageCount(); index++) {
                console.log(`Processing page ${index + 1}`);
    
                let signPosition = signData.filter(res => res.page == index + 1);
                if (signPosition.length > 0) {
                    const [signCopyPage] = await pdfDoc.copyPages(pdfload, [index]);
                    const page = pdfDoc.addPage(signCopyPage);
    
                    signPosition.forEach(element => {
                        const { width, height } = page.getSize();
                        let signSize = element.signSize;
    
                        console.log(`Sign size for page ${index + 1}:`, signSize);
                        let imgWidth = (+signSize.x1 * width) / 100 - (+signSize.x2 * width) / 100;
                        let imgHeight = (+signSize.y1 * height) / 100 - (+signSize.y2 * height) / 100;
                        let offsetX = imgWidth / 2;
                        let offsetY = imgHeight / 2;
    
                        let x = ((width * element.position_percentage.x) / 100) - offsetX;
                        let y = ((height * element.position_percentage.y) / 100) - offsetY;
    
                        console.log(`Signature position: x=${x}, y=${y}, width=${imgWidth}, height=${imgHeight}`);
    
                        page.drawImage(signImage, {
                            x: x,
                            y: y,
                            width: imgWidth,
                            height: imgHeight,
                            opacity: 1,
                        });
                    });
                } else {
                    const [firstDonorPage] = await pdfDoc.copyPages(pdfload, [index]);
                    pdfDoc.insertPage(index, firstDonorPage);
                    console.log(`No signature on page ${index + 1}`);
                }
            }
    
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            console.log("Saved modified PDF");
    
            // Handle CA case
            if (req.body.type == 'ca') {
                console.log("Handling CA signing");
    
                let CA = fs.readFileSync(path.join('D:/data/OrganizationWebupload/ca_files/', req.body.user_ca + '.p12'));
                const p12Data = CA.toString('base64');
                const p12Der = forge.util.decode64(p12Data);
                const p12Asn1 = forge.asn1.fromDer(p12Der, { parseAllBytes: false });
                const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, req.body.caPass);
                const certificate = p12.getBags({ bagType: forge.pki.oids.certBag });
    
                const now = new Date();
                if (now > certificate[forge.pki.oids.certBag][0].cert.validity.notAfter) {
                    console.log("CA certificate expired");
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
    
                const filePath = path.join(__dirname, '..', 'dist', 'server', req.body.documentId + '.pdf');
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }
                fs.writeFileSync(filePath, pdfBuffer, 'binary');
                console.log('Saved CA signed file at:', filePath);
    
                return res.json('http://localhost:3000/api/stampSignature/' + req.body.documentId + '.pdf');
            }
    
            console.log("1111111 => Non-CA type, continuing");
    
            // Save the final signed PDF
            const filePath = path.join(__dirname, '..', 'dist', 'server', req.body.documentId + '.pdf');
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            fs.writeFileSync(filePath, pdfBytes, 'binary');
            console.log('Saved final file at:', filePath);
    
            console.log("222222222 => Finished processing");
            console.log('oca:', req.body.oca);
            console.log('userId:', req.body.userId);
            console.log('document:', req.body.documentId);
    
            return res.json('http://localhost:3000/api/stampSignature/' + req.body.documentId + '.pdf');
        } catch (err) {
            if (err.message == 'PKCS#12 MAC could not be verified. Invalid password?') {
                console.log("Wrong Password => CA Password incorrect");
                return res.status(200).json({ status: false, message: 'รหัสผ่าน CA ไม่ถูกต้อง' });
            } else {
                console.log("Error =>", err.message);
                return res.status(500).json({ error: err.message });
            }
        }
    });

    app.use('/api/stampSignature', express.static(path.join(__dirname, '..', 'dist', 'server')));

    router.route('/test').get(async (req, res: any) => {
        let CAFile = fs.readFileSync('C:/Users/Administrator/Desktop/oca/dist/oca/test.p12')
        console.log(CAFile)
        return res.status(200).send('test')
    })
    app.use('/api', router);
}

export default setRoutes;

