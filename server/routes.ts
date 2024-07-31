import * as express from 'express';


import RecordModelCtrl from './controller/recordController';
import UserModelCtrl from './controller/userController';
import ViewModelCtrl from './controller/viewController';
import RegisterModelCtrl from './controller/registerController';
import uploadService from './service/uploadservice.service';
import uploadservice from './service/uploadservice.service';

import auth from './middleware/auth/auth'

 
// import PdfCtrl from './controller/pdfController';
// import DetailModelCtrl from 'controller/detailController';
// import AggRecordNViewCon from 'controller/aggRecordNviewController'; //petch edit add this

function setRoutes(app): void {
  const router = express.Router();

  const recordModelCtrl = new RecordModelCtrl();
  const userModelCtrl = new UserModelCtrl();
  const viewModelCtrl = new ViewModelCtrl();
  const registerModelCtrl = new RegisterModelCtrl();

  router.route('/record/savepdf').put(recordModelCtrl.savePDF);
  router.route('/pdf/:id').get(recordModelCtrl.getPDF);
  router.route('/data').get(recordModelCtrl.getData);
  // router.route('/pdf').get(itemModelCtrl.getPDF);

  router.route('/record/updateContent').put(recordModelCtrl.updateRecordContent);
  // router.route('/record/updatePDF').put(itemModelCtrl.updateRecordPDF);

  router.route('/postItemData').post(recordModelCtrl.auth, recordModelCtrl.postItemToView);
  router.route('/postTyproText').post(recordModelCtrl.postItemToView);
  // router.route('/postAddDetail').post(itemModelCtrl.addDetail);
  router.route('/postDataTest').post(recordModelCtrl.auth,uploadService.none(),recordModelCtrl.postItemToView)
  // router.route('/postDataTest').post(uploadService.none(), auth.authorize, recordModelCtrl.postItemToView);
 

  // RecordModel routes
  router.route('/recordModel').get(recordModelCtrl.getAll);
  router.route('/recordModel/count').get(recordModelCtrl.count);
  router.route('/recordModel').post(recordModelCtrl.insert);
  router.route('/recordModel/:id').get(recordModelCtrl.get);
  router.route('/recordModel/:id').put(recordModelCtrl.update);
  router.route('/recordModel/:id').delete(recordModelCtrl.delete);

  router.route('/viewModel/getViewByRecordId/:id').get(viewModelCtrl.getViewByRecordId);
  router.route('/recordModel/getRecordWithUserAndEmployee/:id').get(recordModelCtrl.getRecordWithUserAndEmployee)
  

  // UserModel routes
  router.route('/userModel').get(userModelCtrl.getAll);
  router.route('/userModel/count').get(userModelCtrl.count);
  router.route('/userModel').post(userModelCtrl.insert);
  router.route('/userModel/:id').get(userModelCtrl.get);
  router.route('/userModel/:id').put(userModelCtrl.update);
  router.route('/userModel/:id').delete(userModelCtrl.delete);

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
  router.route('/registerModel').post(registerModelCtrl.create);
  router.route('/registerModel/login').post(registerModelCtrl.login);
  router.route('/registerModel/resetPassword').post(registerModelCtrl.resetPassword);
  router.route('/registerModel/forgotPassword').post(registerModelCtrl.forgotPassword); 
  router.route('/registerModel/:id').get(registerModelCtrl.get);
  router.route('/registerModel/:id').put(registerModelCtrl.update);
  router.route('/registerModel/:id').delete(registerModelCtrl.delete);
  // router.route('/getEmp').get(registerModelCtrl.getEmp); 
  router.route('/allUsers').get(registerModelCtrl.getAllUsers); 
  router.route('/user').get(registerModelCtrl.getUsers);

  // router.route('/user/:id').put(registerModelCtrl.updateUserDetails);
  router.route('/userModel/getUserById/:id').get(userModelCtrl.getUserById);
                                                    //,
  router.route('/registerModel/updateProfile').put( auth.authorize,registerModelCtrl.updateEmployeeProfile);
  router.route('/registerModel/updateRole/:id').put(registerModelCtrl.updateUserRole);
  router.route('/registerModel/uploadProfile')
    .put(auth.authorize, uploadservice.single('profile'), registerModelCtrl.uploadProfile);
  //agg $lookup Record and View model routes //petch edit add this
  // router.route('/aggRecordNview/:id').get(AggRecordNViewCon.get);

  app.use('/api', router);
}

export default setRoutes;

