import { ImmediatePriority,scheduleCallback, UserBlockingPriority } from "../src/index";


scheduleCallback(UserBlockingPriority,()=>{
    console.log("BLOCK")
})

scheduleCallback(ImmediatePriority,()=>{
    console.log("IMMEDIATE")
})