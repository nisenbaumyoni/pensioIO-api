import PDFDocument from "pdfkit";
import fs from "fs";
import { loggerService } from "../../services/logger.service.js";
import { atlasDbService } from "../../services/atlasDb.service.js";
import { Pension } from "../../models/pension.model.js";

export const pensionService = {
    query,
    getById,
    remove,
    save,
    generatePDF,
    getStats
};

const PAGE_SIZE = 10;

async function query(filterBy = {}) {
    try {
        const { page = 1, limit = PAGE_SIZE, sortBy = 'createdAt', sortOrder = -1 } = filterBy;
        
        const options = {
            sort: { [sortBy]: sortOrder },
            page,
            limit
        };

        // Build filter criteria
        const criteria = {};
        if (filterBy.fullName) {
            criteria.fullName = new RegExp(filterBy.fullName, 'i');
        }
        if (filterBy.email) {
            criteria.email = new RegExp(filterBy.email, 'i');
        }
        if (filterBy.employmentStatus) {
            criteria.employmentStatus = filterBy.employmentStatus;
        }
        if (filterBy.married !== undefined) {
            criteria.married = filterBy.married;
        }

        const pensions = await atlasDbService.query(Pension, criteria, options);
        loggerService.debug(`Retrieved ${pensions.docs.length} pensions`);
        return pensions;
    } catch (err) {
        loggerService.error('Had problems getting pensions...', err);
        throw err;
    }
}

async function generatePDF() {
  // Create a PDF document and pipe it to a file

  const pensionsForPdf = await pensionService.query();

  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream("./data/pension.pdf"));

  // Create an object where the index is the key and pension data is the value
  const pensionsObject = {};
  pensionsForPdf.forEach((pension, index) => {
    pensionsObject[index] = {
      id: pension._id,
      title: pension.title,
      description: pension.description,
      severity: pension.severity,
      createdAt: new Date(pension.createdAt).getFullYear(),
    };
  });

  // Add JSON representation of pensionsObject to PDF
  pdfDoc.text(JSON.stringify(pensionsObject, null, 2));
  //Finalize the pdf
  pdfDoc.end();

  return pdfDoc;
}

async function getById(pensionId) {
  loggerService.info(`Getting pension by ID: ${pensionId}`);

    try {
        const options = {
            limit: 1  // We only want one result
        };
        
        // Query using the pension ID
        loggerService.info(`Querying pension with ID: ${pensionId}`);
        const result = await atlasDbService.query(Pension, { _id: pensionId }, options);
        loggerService.debug(`Result: ${JSON.stringify(result)}`);
        
        if (!result.docs || result.docs.length === 0) {
            throw new Error('Pension not found');
        }

        const pension = result.docs[0];
        loggerService.debug(`Retrieved pension ${pensionId}`);
        return pension;
    } catch (err) {
        loggerService.error(`Had problems getting pension ${pensionId}...`, err);
        throw err;
    }
}

async function remove(pensionId) {
    try {
        await atlasDbService.remove(Pension, pensionId);
        loggerService.info(`Pension ${pensionId} was removed`);
        return 'Ok';
    } catch (err) {
        loggerService.error(`Had problems removing pension ${pensionId}...`, err);
        throw err;
    }
}

async function save(pension) {
    try {
        if (pension._id) {
            // Update
            const updatedPension = await atlasDbService.update(Pension, pension._id, pension);
            loggerService.info(`Pension ${pension._id} was updated`);
            return updatedPension;
        } else {
            // Create
            const newPension = await atlasDbService.create(Pension, pension);
            loggerService.info(`New pension was created with id: ${newPension._id}`);
            return newPension;
        }
    } catch (err) {
        loggerService.error('Had problems saving pension', err);
        throw err;
    }
}

async function getStats() {
    try {
        const stats = await atlasDbService.aggregate(Pension, [
            {
                $group: {
                    _id: null,
                    totalPensions: { $sum: 1 },
                    avgIncome: { $avg: '$currentIncome' },
                    avgAge: {
                        $avg: {
                            $divide: [
                                { $subtract: [new Date(), '$dateOfBirth'] },
                                (365 * 24 * 60 * 60 * 1000)  // Convert to years
                            ]
                        }
                    },
                    marriedCount: {
                        $sum: { $cond: ['$married', 1, 0] }
                    },
                    avgChildren: { $avg: '$numberOfChildren' }
                }
            }
        ]);
        return stats[0] || {
            totalPensions: 0,
            avgIncome: 0,
            avgAge: 0,
            marriedCount: 0,
            avgChildren: 0
        };
    } catch (err) {
        loggerService.error('Had problems getting pension stats', err);
        throw err;
    }
}

function _makeId(length = 6) {
  var txt = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return txt;
}

function _readJsonFile(path) {
  const str = fs.readFileSync(path, "utf8");
  const json = JSON.parse(str);
  return json;
}

function _savePensionsToFile(path) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(pensions, null, 2);
    fs.writeFile(path, data, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
