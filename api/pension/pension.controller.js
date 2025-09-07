import { loggerService } from "../../services/logger.service.js";
import { pensionService } from "./pension.service.js";
import { authService } from "../auth/auth.service.js";



async function getPensions(req, res) {
  loggerService.info(`pension.controller - getPensionById - req.params: ${req.params}`);
  try {
    const filterBy = {
      title: req.query.title || "",
      severity: req.query.severity,
      dateSort: req.query.dateSort,
      pageIndex: req.query.pageIndex,
    };
    const pensions = await pensionService.query(filterBy);
    res.send(pensions);
  } catch (err) {
    res.status(400).send(`Couldn't get pension`);
  }
}

async function getPensionById(req, res) {
  loggerService.info(`pension.controller - getPensionById - req.params: ${JSON.stringify(req.params)}`);

  var { pensionId } = req.params;
  try {
    const pension = await pensionService.getById(pensionId);

    if (pension) {
      var { visitedPensions = "" } = req.cookies;
      visitedPensions = pensionId + "," + visitedPensions;
      const visitedPensionsArray = visitedPensions.split(",");
      if (
        visitedPensionsArray.length > 0 &&
        visitedPensionsArray[visitedPensionsArray.length - 1] === ""
      ) {
        visitedPensionsArray.pop();
      }

      if (visitedPensionsArray.length > 3) throw "Wait for a bit";
      res.cookie("visitedPensions", visitedPensions, { maxAge: 5 * 1000 });
      res.send(pension);
    } else {
      res.status(404).send({ error: "Pension not found" });
    }
  } catch (err) {
    if (err === "Wait for a bit") {
      console.error(err);
      res.status(401).send(err);
    } else {
      console.error(err);
      res.status(500).send({ error: "Internal server error" });
    }
  }
}

async function exportPdf(req, res) {
  try {
    const pdfDoc = await pensionService.generatePDF();
    // res.send(pdfDoc);

    // Set the appropriate headers to indicate it's a PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=pension.pdf");

    // Pipe the PDF document to the response
    pdfDoc.pipe(res);
  } catch (err) {
    res.status(400).send(`Couldn't export pdf`, err);
  }
}

async function savePension(req, res) {
  const { _id, title, description, severity, createdAt, createdBy } = req.body;
  const pensionToSave = {
    _id: _id,
    title: title,
    description: description,
    severity: +severity,
    createdAt: +createdAt,
    createdBy: createdBy ? createdBy : { _id: 1, fullname: "anonymous user" },
  };

  try {
    const result = await pensionService.save(pensionToSave);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
}

async function updatePension(req, res) {
  const { _id, title, description, severity, createdAt } = req.body;
  const pensionToSave = {
    _id: _id,
    title: title,
    description: description,
    severity: +severity,
    createdAt: +createdAt,
  };

  try {
    const result = await pensionService.save(pensionToSave);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
}

async function deletePension(req, res) {
  var { pensionId } = req.params;

  try {
    const result = pensionService.remove(pensionId);
    res.send(`Pension ${pensionId} was removed`);
  } catch (err) {
    console.log(err);
  }
}

export const pensionController = {
  getPensions,
  getPensionById,
  exportPdf,
  savePension,
  updatePension,
  deletePension,
};
