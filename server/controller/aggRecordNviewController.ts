// import * as mongoose from 'mongoose';
// import recordModel from '../models/recordModel';
// import ViewModel from '../models/viewModel';
// import BaseCtrl from './base';
// import recorCon from './recordController';

// class AggRecordNViewCon extends BaseCtrl {
//     model= recordModel;
//     constructor() {
//         super();
//         this.aggregateRecordsAndView();
//     }

//     async aggregateRecordsAndView() {
//         try {
//             const result = await recordModel.aggregate([
//                 {
//                     $lookup: {
//                         from: 'ViewModel',
//                         localField: 'record_id',
//                         foreignField: 'record_id', // สมมติว่ามี field record_id ใน collection view
//                         as: 'view_info'
//                     }
//                 }
//             ]).exec();

//             console.log(result);
//         } catch (error) {
//             console.error(error);
//         }
//     }
// }

// export default AggRecordNViewCon;
