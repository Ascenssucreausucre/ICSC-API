const ExcelJS = require("exceljs");
const { Author, Article } = require("../models/index.js");
async function ImportExceldata(filePath, conferenceId) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const headerRow = worksheet.getRow(1);
  const headerMap = {};

  headerRow.eachCell((cell, colNumber) => {
    const header = cell.text.trim();
    headerMap[header] = colNumber;
  });

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const authorName = row.getCell(headerMap["Author"]).text.trim();
    const authorAffiliation = row.getCell(headerMap["Affiliation"]).text.trim();
    const authorCountry = row.getCell(headerMap["Country"]).text.trim();
    const authorPIN = row.getCell(headerMap["PIN"]).text.trim();
    const articleTitle = row.getCell(headerMap["Title"]).text.trim();
    const articleType = row.getCell(headerMap["Type"]).text.trim();
    const articleNr = row.getCell(headerMap["Nr"]).text.trim();
    const articleStatus = row.getCell(headerMap["Status"]).text.trim();

    await processRow(
      authorName,
      authorAffiliation,
      authorCountry,
      authorPIN,
      articleTitle,
      articleType,
      articleNr,
      articleStatus
    );
  }

  async function processRow(
    authorName,
    authorAffiliation,
    authorCountry,
    authorPIN,
    articleTitle,
    articleType,
    articleNr,
    articleStatus
  ) {
    try {
      if (authorPIN) {
        let author = await Author.findByPk(authorPIN);

        const [surname, name] = authorName.split(",").map((s) => s.trim());

        if (!author) {
          author = await Author.create({
            name,
            surname,
            id: authorPIN,
            country: authorCountry,
            affiliation: authorAffiliation,
          });
        }
      }

      if (articleNr) {
        let article;

        const existingArticle = await Article.findOne({
          where: {
            nr: articleNr,
          },
        });
        if (!existingArticle) {
          const validStatuses = ["pending", "accepted", "rejected"];
          let validStatus = articleStatus.toLowerCase();

          if (!validStatuses.includes(validStatus)) {
            validStatus = undefined;
          }
          article = await Article.create({
            title: articleTitle,
            profile:
              articleType === "Contributed Paper" ? "Contributed" : "Invited",
            conference_id: conferenceId,
            status: validStatus,
            nr: articleNr,
          });
        } else {
          article = existingArticle;
        }
        await article.addAuthor(authorPIN);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  console.log("Import done.");
}
module.exports = ImportExceldata;
