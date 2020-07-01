const pdfMakePrinter = require('pdfmake/src/printer');
const fs = require('fs');

const  generatePdf = async (fileName, content, successCallback, errorCallback) => {

        const fonts = {
            Courier: {
                normal: 'Courier',
                bold: 'Courier-Bold',
                italics: 'Courier-Oblique',
                bolditalics: 'Courier-BoldOblique'
            },
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            },
            Times: {
                normal: 'Times-Roman',
                bold: 'Times-Bold',
                italics: 'Times-Italic',
                bolditalics: 'Times-BoldItalic'
            },
            Symbol: {
                normal: 'Symbol'
            },
            ZapfDingbats: {
                normal: 'ZapfDingbats'
            }
        };
try{
        const printer = new pdfMakePrinter(fonts);
        const doc = await printer.createPdfKitDocument(content);
        //return doc;

            doc.pipe(
                fs.createWriteStream(fileName).on("error", (err) => {
                    errorCallback(err.message);
                })
            );

            doc.on('end', () => {
                successCallback("PDF successfully created and stored");
            });

            doc.end();

        } catch(err) {
            throw(err);
        }


};

const writePdf = async (doc, pdfFolderPath) => {
    doc.pipe(
         fs.createWriteStream(pdfFolderPath).on("error", (err) => {
            console.log(err)
        })
    );

    doc.on('end', () => {
        console.log("PDF successfully created and stored");
    });

      doc.end();
}

module.exports = {generatePdf, writePdf}