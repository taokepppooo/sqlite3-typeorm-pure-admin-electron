import { Router } from "express";
import { UserController } from "@electron/controller/UserController";

const router = Router();

router.post("/save", async (req, _res) => {
  console.log(req);
  const userController = new UserController();
  await userController.save(req.body);
});

export const userApiRouter = router;
