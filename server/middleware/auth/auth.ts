
const jwt = require('jsonwebtoken')

const handleResponse = (req, res) => res.status(req.response.status).json(req.response.data);

const forbidden = (req, res) => {
  res.status(403).end(); 
};

const authorize = async (req, res, next) => {
  const token = req.headers?.authorization ? req.headers?.authorization.split(' ')[1] : req.body.headers?.Authorization;
  try {
    // let urlArray = ["getVideoStream"]
    if(token){
      // const decoded = await JwtHelper.decodeToken(token);
      console.log("token :",token);
      
      const decoded = jwt.verify(token , process.env.SECRET_TOKEN || 'your_jwt_secret_key' )
      req.user = decoded.user;
      // console.log("searchStringInArray if : ",searchStringInArray(req.url, urlArray));
      next();
    }
    else{
      // console.log("searchStringInArray  else: ",searchStringInArray(req.url, urlArray));
      // if(searchStringInArray(req.url, urlArray) != -1 ){
      //     next();
      // } //text.search(/blue/i);
      // res.status(401).json({"message" : "ไม่พบ token", status: false});
      return res.status(401).json({"message" : "ไม่พบ token", status: false})
    }
  } catch (err) {
    //console.log(err);
    res.status(401);
    res.json({ success: false, message: err });
  }
};

// function searchStringInArray (str, strArray) {
//   for (var j=0; j<strArray.length; j++) {
//       if (str.match(strArray[j])) return j;
//   }
//   return -1;
// }

// const authorizeAdmin = async (req, res, next) => {
//   const token = req.headers.authorization;
//   try {
//     const data = await jwt.verify(token, encrypt.coder);
//     req.user = data;
//     if (req.user.role === 'admin' || req.user.role === 'superadmin') {
//       next();
//     } else {
//       res.json({ success: false, message: 'Permission Denied, need Admin permission' });
//     }
//   } catch (err) {
//     res.status(httpstatus.UNAUTHORIZED);
//     res.json({ success: false, message: err });
//   }
// };
// const authorizeSuperAdmin = async (req, res, next) => {
//   const token = req.headers.authorization;
//   try {
//     const data = await jwt.verify(token, encrypt.coder);
//     req.user = data;
//     if (req.user.role === 'superadmin') {
//       next();
//     } else {
//       res.json({ success: false, message: 'Permission Denied, need SuperAdmin permission' });
//     }
//   } catch (err) {
//     res.status(httpstatus.UNAUTHORIZED);
//     res.json({ success: false, message: err });
//   }
// };


export default { 
  handleResponse, forbidden, authorize //, authorizeAdmin, authorizeSuperAdmin 
};
