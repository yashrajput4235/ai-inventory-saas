const express=require("express");
const router=express.Router();

const {createStore}=require("../controllers/store.controller");
const {authMiddleware}=require("../middleware/auth.middleware");
const {roleMiddleware}=require("../middleware/role.middleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    createStore
);
module.exports=router;