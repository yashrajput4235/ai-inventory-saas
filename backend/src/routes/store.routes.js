const express=require("express");
const router=express.Router();

const {createStore, getStores}=require("../controllers/store.controller");
const {authMiddleware}=require("../middleware/auth.middleware");
const {roleMiddleware}=require("../middleware/role.middleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware(["admin"]),
    createStore
);

router.get(
    "/",
    authMiddleware,
    getStores
);

module.exports=router;