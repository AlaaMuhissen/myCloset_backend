import jwt from "jsonwebtoken";
import User from "../models/users.schema.js";

export const isAuth = async (req, res, next) => {
  try {
    let token;
    //* get the headers Auth from client
    const authHeader = req.headers.Authorization || req.headers.authorization;
    //* check if there is auth token
    // if (authHeader && authHeader.startWith("Bearer"))
    if (authHeader) {
      //* split the token to delete bearer keyword
      console.log("token: ", authHeader);
      token = authHeader.split(" ")[1];
      console.log(token)
      // token = authHeader;
      console.log("token: ", token);
      //* verify the token with the secret
      jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        //* check if error on decoding
        if (err) {
          console.error(`ERROR DECODING ${token}`);
          return res.status(401).send("Invalid token");
        }

        console.log("decoded", decoded);
        //* extract the id from the payload body we sent on login func
        const { id } = decoded;
        //* find the user using the id
        const user = await User.findById(id);
        //* check if there is a user
        if (!user) {
          return res.status(404).send("User not found");
        }
        req.user = user;

        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "Teacher") {
      res.status(403);
      throw new Error("Access Forbbiden");
    }

    next();
  } catch (error) {
    next(error);
  }
};
