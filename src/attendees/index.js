const express = require ('express')
const {writeFile, readFile} = require("../utitlities")
const { check, param, body, validationResult } = require("express-validator");
const sgMail = require('@sendgrid/mail');
const {generatePdf, writePdf} = require('../utitlities/makePDF')
const {join} = require('path')
const directory = join(__dirname, "attendees.json")
const fs = require('fs')

const uniqueEmail = async (req, resp, next) => {
    const data = await  readFile(directory);
    const { email } = req.body;

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
       const doc = await generatePdf(pdfFolderPath, docDefinition, (response) => {

           sgMail.setApiKey(process.env.SENDGRID_API_KEY);

           fs.readFile(pdfFolderPath, function(err, data) {
               let data_base64 = data.toString('base64')
               sgMail.send({
                   to: 'tetianayaremko@gmail.com',
                   from: 'ty000002@red.ujaen.es',
                   subject: 'Report',
                   text: 'report',
                   attachments: [{
                       filename: 'Report.pdf',
                       content: data_base64,
                       type: 'application/pdf',
                       disposition: 'attachment',

                   }],
               }).then((response) => {
                   res.status(200).send('Success');
               })
                   .catch((err) => {
                       res.status(500).send(err);
                   });
           })
           res.json({
               status: 200,
               data: response
           });
       }, (error) => {
           // doc creation error
           res.json({
               status: 400,
               data: error
           });
       } )


    }catch (e) {
        e.httpRequestStatusCode = 500;
        next(e);
    }

})

module.exports = router