const jwt = require("jsonwebtoken");

//const userKey = 'b453dfe3-2d8a-4528-82aa-8ce52f0568b4'; // dev
const userKey = '22a3f4a7-7719-4d92-91f0-a4603a0a3484'; // release
const payload = {
  appId: 'testing-next-zeta.vercel.app', 
  platform: "web"
};

const options = {
  header: { typ: "JWT", alg: "HS256" },
  expiresIn: 60 * 5 // expire time: 5 mins
};

function generateJWT(req, res) {
  try {
    const clientToken = jwt.sign(payload, userKey, options);
    res.json({ appId: payload.appId, token: clientToken });
  } catch (e) {
    console.log("jwt generate err ", e.name, e.message);
  }
}

// generateJWT.js(Server) append
// export default (req, res) => {
//   if (req.method === "GET") return generateJWT(req, res);
//   // if (req.method === "POST") return generateJWT(req, res);
//  };

export default function handler(req, res){
  if (req.method === "GET") return generateJWT(req, res);
  // if (req.method === "POST") return generateJWT(req, res);
};
 