const authRouter = require('express').Router();
const logger = require('../utils/logger');
const hash = require('../utils/hash');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const _ = require('underscore');

const createSessionToken = async (user) => {
    // create uuid for user
    let uuid = uuidv4();
    // make sure session token doesn't already exist for user
    while (_.contains(_.map(user.sessionTokens, tokenObj => tokenObj.uuid), uuid)) {
        uuid = uuidv4();
    }
    // store token in db
    user.sessionTokens = [
        ...user.sessionTokens,
        { uuid: uuid }
    ];
    try {
        await User.updateOne(user);
    } catch (err) {
        // Issue creating user token, report to client
        return {
            res: { type: "error", message: "Error creating session." },
            sessionToken: uuid
        };
    }

    // Successfully created user session, send token back to client
    return {
        res: { type: "success", message: "success" },
        sessionToken: uuid
    };
};

authRouter.post('/signup', async (request, response) => {
    try {
        /*
        ***** CHECK FOR EXISTING USERS ***** 
        */
        var existingUser = await User.findOne({ email: request.body.email });
        if (!existingUser) {
            // attempt to fetch user by name if no user by email
            existingUser = await User.findOne({ name: request.body.name });
        }
        // if a user exists, report username/password already in use
        if (existingUser) {
            response.json({ type: "error", message: "Username/Email already exists." });
        } else {
            /*
            ***** HASH PASSWORD AND SAVE USER ***** 
            */
            var user = {
                name: request.body.name,
                email: request.body.email,
                passHash: await hash.hashPassword(request.body.password),
                permissions: request.body.permissions,
                sessionTokens: []
            }

            try {
                // create user in database
                await User.create(user);
                // log them in by creating a session token and sending it back to the client
                const {res, sessionToken } = await createSessionToken(user);
                response.cookie('sessionToken', sessionToken, {});
                response.cookie('name', user.name, {});
                response.cookie('email', user.email, {});
                response.status(200).json(res);
            } catch (err) {
                response.json({ type: "error", message: "User could not be saved to database. Please contact system administrator." });
            }
        }     
    } catch (err) {
        response.json({ type: "error", message: "Internal Error while logging in. Please contact system adminisitrator." });
    }
});

authRouter.post('/login', async (request, response) => {
    try {
        /* 
        ***** FETCH USER FROM DATABASE ***** 
        */

        /*
            Expected Body
            {
                userId: email or username of user,
                password: password of user
            }
        */

        // attempt to fetch user by email
        var user = await User.findOne({ email: request.body.userId });
        if (!user) {
            // attempt to fetch user by name if no user by email
            user = await User.findOne({ name: request.body.userId });
        }
        // if still no user, report issue finding user
        if (!user) {
            response.json({ type: "error", message: "Invalid Username/Email or Password." });
        } else {
            /* 
            ***** VERIFY USER PASSWORD ***** 
            */
            if (await hash.verifyPassword(user.passHash, request.body.password)) {
                console.log("PASS");
                // createSessionToken returns a response object
                const {res, sessionToken } = await createSessionToken(user);
                logger.info(sessionToken);
                response.cookie('sessionToken', sessionToken, {});
                response.cookie('name', user.name, {});
                response.cookie('email', user.email, {});
                response.json(res);
            } else {
                console.log("FAIL");
                response.status(200).json({ type: "error", message: "Invalid Username/Email or Password." });
            }
        } 
    } catch (err) {
        response.json({ type: "error", message: "Internal Error while logging in. Please contact system adminisitrator." });
    }
});

authRouter.post('/logout', async (request, response) => {
    logger.info(request.cookies);
    /*
        Expected cookies:
        sessionToken,
        name,
        email
    */
    // remove session from database
    try {
        // attempt to fetch user by email
        var user = await User.findOne({ email: request.cookies.email });
        if (!user) {
            // attempt to fetch user by name if no user by email
            user = await User.findOne({ name: request.cookies.name });
            if (!user) {
                throw new Error();
            }
        }
        
        // filter out token that needs to be removed
        user.sessionTokens = _.filter(user.sessionTokens, (token) => {
            return token.uuid !== request.cookies.sessionToken;
        });

        // update that user
        await User.updateOne(user);

    } catch (err) {
        response.json({ type: "error", message: "Missing cookies." })
    }

    response.status(200).json(request.cookies);
});

module.exports = authRouter;