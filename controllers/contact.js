const contactRouter = require('express').Router();
const nodemailer = require('nodemailer');
const emailCheck = require('email-check');
const logger = require('../utils/logger');

contactRouter.post('/', (request, response, next) => {
    const mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'benpiro1118@gmail.com',
            pass: 'iioychduvqvsbrcy'
        }
    });
    
    const mailDetailsToOwner = {
        from: 'benpiro1118@gmail.com',
        to: 'benpiro1118@gmail.com',
        subject: `${request.body.name} (${request.body.email}) sent you an email on HighWire Shop!`,
        text: request.body.message
    };

    const mailDetailsToSender = {
        from: 'benpiro1118@gmail.com',
        to: request.body.email,
        subject: `HighWire Shop`,
        text: `Thanks for sending us an email, ${request.body.name}! We will get back to you soon!`
    };

    // First check if sender's email is valid
    emailCheck(request.body.email)
        .then((res) => {
            if (res) {
                logger.info("Email exists");
                var promiseSendEmails = new Promise((resolve, reject) => sendEmails(resolve, reject));
                promiseSendEmails
                    .then((res) => {
                        logger.info("success");
                        response.json({ type: "success", message: "Message sent!" });
                    })
                    .catch((err) => {
                        throw new Error("Enountered issue sending emails");
                    });
            } else {
                throw new Error("Invalid Email");
            }
        })
        .catch((err) => {
            logger.error("error");
            if (err.message === "refuse") {
                // The MX server is refusing requests from your IP address
                response.json({ type: "error", message: err.message });
            } else {
                // Decide what to do with other errors
                response.json({ type: "error", message: err.message });
            }
        });

    const sendEmails = (resolve, reject) => {
        var promiseToSender = new Promise((resolve, reject) => sendToSender(resolve, reject));
        promiseToSender
            .then((res) => {
                resolve("success");
            })
            .catch((err) => {
                reject("error");
            });
        
        var promiseToOwner = new Promise((resolve, reject) => sendToOwner(resolve, reject));
        promiseToOwner
            .then((res) => {
                resolve("success");
            })
            .catch((err) => {
                reject("error");
            });
    };

    const sendToSender = (resolve, reject) => {
        mailTransporter.sendMail(mailDetailsToSender, function (err, data) {
            if (err) {
                return reject(err);
            } else {
                return resolve(`Email to sender (${request.body.email}) success!`);
            }
        });
    };
    
    const sendToOwner = (resolve, reject) => {
        mailTransporter.sendMail(mailDetailsToOwner, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve("Email to owner success!")
            }
        });
    };
});

module.exports = contactRouter;