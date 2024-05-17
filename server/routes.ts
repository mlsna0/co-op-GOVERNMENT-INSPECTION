import * as express from 'express';

import ItemModelCtrl from './controller/itemController';

function setRoutes(app): void {
  const router = express.Router();
  const itemModelCtrl = new ItemModelCtrl();

  // Testst
  router.route('/itemModel').get(itemModelCtrl.getAll);
  router.route('/itemModel/count').get(itemModelCtrl.count);
  router.route('/itemModel').post(itemModelCtrl.insert);
  router.route('/itemModel/:id').get(itemModelCtrl.get);
  router.route('/itemModel/:id').put(itemModelCtrl.update);
  router.route('/itemModel/:id').delete(itemModelCtrl.delete);

  app.use('/api', router);

}

export default setRoutes;
