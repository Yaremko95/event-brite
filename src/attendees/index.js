const express = require ('express')
const {writeFile, readFile} = require("../utitlities")
const { check, param, body, validationResult } = require("express-validator");
const sgMail = require('@sendgrid/mail');
const {generatePdf} = require('../utitlities/makePDF')
const {join} = require('path')
const directory = join(__dirname, "attendees.json")
const fs = require('fs')

const uniqueEmail = async (req, resp, next) => {
    const data = await  readFile(directory);
    const { email } = req.body;
    console.log(email )

    if (
        data.filter((user) => user.email === email)
            .length === 0
    ) {
        next();
    } else {

        next("Bad request");
    }
};
const validateBody = () => {
    return [
        check("firstName").exists().withMessage("firstName is required").not().isEmpty(),
        check("surname")
            .exists()
            .withMessage("Surname is required")
            .not()
            .isEmpty(),

        check("email").exists().withMessage("Email is required").isEmail(),
        check("arrivalTime")
            .exists()
            .withMessage("arrivalTime is required")
            .not()
            .isEmpty()
            .isDate(),
    ];
};
const router = express.Router()
router.route("/sendEmail")
.post(validateBody(), uniqueEmail, async(req, res, next)=> {
    try {
        let writtenData = await writeFile(directory, req.body)


        const docDefinition = {
            content: [`${req.body.firstName}, see you at my birthday barty on Saturday at ${req.body.arrivalTime}`],
            defaultStyle: {
                font: 'Helvetica'
            }
        };
        const pdfFolderPath = join(__dirname, `../docs/${req.body.surname}.pdf`)
       const doc = await generatePdf(pdfFolderPath, docDefinition)
      await doc.pipe(
            fs.createWriteStream(pdfFolderPath).on("error", (err) => {
                console.log(err)
            })
        );

        doc.on('end', () => {
            console.log("PDF successfully created and stored");
        });

        doc.end();

        const bitmap = await fs.readFileSync(pdfFolderPath);
        let data_base64 = await new Buffer(bitmap).toString('base64')

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: 'tetianayaremko@gmail.com',
            from: 'ty000002@red.ujaen.es',
            subject: 'Sending with Twilio SendGrid is Fun',
            text: 'and easy to do anywhere, even with Node.js',
                attachments :
                    [{filename: 'Report.pdf',
                    content: data_base64,
                    type: 'application/pdf',
                    disposition: 'attachment',

                }],
        };
       await  sgMail.send(msg).then((response) => {
             res.status(200).send('Success');
         })
             .catch((err) => {
                 res.status(500).send(err);
             });
        // res.contentType("application/pdf");
        // response.pipe(res);
        // response.end();
        // res.send(response)

    }catch (e) {
        e.httpRequestStatusCode = 500;
        next(e);
    }

})

module.exports = router