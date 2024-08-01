
// import TimeStampModelCtrl from "../../controller/timeStampController";
const jwt = require('jsonwebtoken')

const handleResponse = (req, res) => res.status(req.response.status).json(req.response.data);

const forbidden = (req, res) => {
  res.status(403).end(); 
};

 const authorize= async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  console.log("auth ", token);
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    console.log("decoded middleware : ",decoded)
    req.user = decoded.user;

    // const timeStampCtrl = new TimeStampModelCtrl();
    // await timeStampCtrl.addTimeStamp(req, res);

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



export default { 
  handleResponse, forbidden, authorize //, authorizeAdmin, authorizeSuperAdmin 
};
