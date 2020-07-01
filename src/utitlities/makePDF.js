const pdfMakePrinter = require('pdfmake/src/printer');
const fs = require('fs');

const  generatePdf = async (fileName) => {

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
        const docDefinition = {
            content: [
                'First paragraph',
                'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines',
            ],
            defaultStyle: {
                font: 'Helvetica'
            }
        };
        const printer = new pdfMakePrinter(fonts);
        const doc = await printer.createPdfKitDocument(docDefinition);
        return doc;


};

module.exports = {generatePdf}