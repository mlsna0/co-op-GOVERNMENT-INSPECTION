import * as express from 'express';

import ItemModelCtrl from './controller/itemController';
import RecordModelCtrl from './controller/recordController';
import UserModelCtrl from './controller/userController';
import ViewModelCtrl from './controller/viewController';
import uploadService from './service/uploadservice.service'
// import DetailModelCtrl from 'controller/detailController';
// import AggRecordNViewCon from 'controller/aggRecordNviewController'; //petch edit add this

function setRoutes(app): void {
  const router = express.Router();
  const itemModelCtrl = new ItemModelCtrl();
  const recordModelCtrl = new RecordModelCtrl();
  const userModelCtrl = new UserModelCtrl();
  const viewModelCtrl = new ViewModelCtrl();
  // const detailModelCtrl = new DetailModelCtrl();

  // const aggregateRecordsAndView = new AggRecordNViewCon(); //petch edit add this

  // ItemModel routes
  router.route('/itemModel').get(itemModelCtrl.getAll);
  router.route('/itemModel/count').get(itemModelCtrl.count);
  router.route('/itemModel').post(itemModelCtrl.insert);
  // router.route('/postPersonData').post(itemModelCtrl.postItemToView);

  router.route('/data').get(itemModelCtrl.getData);
  router.route('/record/updateContent').put(itemModelCtrl.updateRecordContent);

  router.route('/postItemData').post(itemModelCtrl.postItemToView);
  router.route('/postTyproText').post(itemModelCtrl.postItemToView);
  // router.route('/postAddDetail').post(itemModelCtrl.addDetail);
  router.route('/itemModel/:id').get(itemModelCtrl.get);
  router.route('/itemModel/:id').put(itemModelCtrl.update);
  router.route('/itemModel/:id').delete(itemModelCtrl.delete);
  router.route('/postDataTest').post(uploadService.none(),itemModelCtrl.postItemToView)

  // RecordModel routes
  router.route('/recordModel').get(recordModelCtrl.getAll);
  router.route('/recordModel/count').get(recordModelCtrl.count);
  router.route('/recordModel').post(recordModelCtrl.insert);
  router.route('/recordModel/:id').get(recordModelCtrl.get);
  router.route('/recordModel/:id').put(recordModelCtrl.update);
  router.route('/recordModel/:id').delete(recordModelCtrl.delete);

  router.route('/viewModel/getViewByRecordId/:id').get(viewModelCtrl.getViewByRecordId);
  

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

  
  //agg $lookup Record and View model routes //petch edit add this
  // router.route('/aggRecordNview/:id').get(AggRecordNViewCon.get);

  app.use('/api', router);
}

export default setRoutes;
