const { getAuth } = require("firebase-admin/auth");

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Firebase Verification Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid Firebase Token",
    });
  }
}

module.exports = verifyFirebaseToken;