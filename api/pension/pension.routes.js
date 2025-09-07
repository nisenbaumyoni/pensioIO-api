import express from "express";
import { pensionController } from "./pension.controller.js";
import { requireUser} from "../../middlewares/requireAuth.middleware.js"

const router = express.Router();

//router.get("/", requireUser , pensionController.getPensions);
router.get("/", pensionController.getPensions);

// router.get("/export", requireUser , pensionController.exportPdf);
// router.get("/:pensionId", requireUser , pensionController.getPensionById);
// router.delete("/:pensionId", requireUser , pensionController.deletePension);
// router.post("/", requireUser , pensionController.savePension);
// router.put("/", requireUser , pensionController.updatePension);

router.get("/export", pensionController.exportPdf);
router.get("/:pensionId", pensionController.getPensionById);
router.delete("/:pensionId", pensionController.deletePension);
router.post("/", pensionController.savePension);
router.put("/", pensionController.updatePension);


export const pensionRoutes = router;
