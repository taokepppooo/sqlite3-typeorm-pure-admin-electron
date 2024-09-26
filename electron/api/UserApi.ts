import type express from "express";
import { Router, type Request, type Response } from "express";
import { UserController } from "@electron/controller/UserController";

const router = Router();
const userController = new UserController();

router.post("/save", async (req: Request, res: Response) => {
  await userController.save(req.body);

  res.send({
    code: 200,
    success: true,
    msg: "success"
  });
});

export const userApiRouter = router;

export const useUserRouter = (app: typeof express) => {
  app.use("/user", userApiRouter);
};
