const express = require("express");
const { writeFile, readFile } = require("../utitlities");
const { check, param, body, validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");
const { generatePdf, writePdf } = require("../utitlities/makePDF");
const { join } = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { Transform } = require("json2csv");
const pump = require("pump");

const directory = join(__dirname, "attendees.json");

const uniqueEmail = async (req, resp, next) => {
  const data = await readFile(directory);
  const { email } = req.body;

  if (data.filter((user) => user.email === email).length === 0) {
    next();
  } else {
    next("Bad request");
  }
};
const validateBody = () => {
  return [
    check("firstName")
      .exists()
      .withMessage("firstName is required")
      .not()
      .isEmpty(),
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
const router = express.Router();
router
  .route("/sendEmail")
  .post(validateBody(), uniqueEmail, async (req, res, next) => {
    try {
      let writtenData = await writeFile(directory, req.body);

      const docDefinition = {
        content: [
          `${req.body.firstName}, see you at my birthday barty on Saturday at ${req.body.arrivalTime}`,
        ],
        defaultStyle: {
          font: "Helvetica",
        },
      };
      const pdfFolderPath = join(__dirname, `../docs/${req.body.surname}.pdf`);
      const doc = await generatePdf(
        pdfFolderPath,
        docDefinition,
        (response) => {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          fs.readFile(pdfFolderPath, function (err, data) {
            let data_base64 = data.toString("base64");
            const { email } = req.body;
            sgMail
              .send({
                to: email,
                from: "ty000002@red.ujaen.es",
                subject: "Invitation for Diego's birthday",
                text: "I'll see you at the party",
                attachments: [
                  {
                    filename: "invitation.pdf",
                    content: data_base64,
                    type: "application/pdf",
                    disposition: "attachment",
                  },
                ],
              })
              .then((response) => {
                res.status(200).send("Success");
              })
              .catch((err) => {
                res.status(500).send(err);
              });
          });
          res.json({
            status: 200,
            data: response,
          });
        },
        (error) => {
          res.json({
            status: 400,
            data: error,
          });
        }
      );
    } catch (e) {
      e.httpRequestStatusCode = 500;
      next(e);
    }
  });

router.route("/csv").get((req, res, next) => {
  try {
    let readableStream = fsExtra.createReadStream(directory);
    const json2csv = new Transform({
      fields: ["firstName", "surname", "email", "arrivalTime", "_id"],
    });
    res.setHeader("Content-Disposition", "attachment; filename=export.csv");
    pump(readableStream, json2csv, res, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Done");
      }
    });
  } catch (error) {
    error.httpRequestStatusCode = 500;
    next(error);
  }
});

module.exports = router;
