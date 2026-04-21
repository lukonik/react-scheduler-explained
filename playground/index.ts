import { ImmediatePriority, unstable_scheduleCallback, UserBlockingPriority } from "../src/index";
// export const NoPriority = 0;
// export const ImmediatePriority = 1;
// export const UserBlockingPriority = 2;
// export const NormalPriority = 3;
// export const LowPriority = 4;
// export const IdlePriority = 5;

unstable_scheduleCallback(UserBlockingPriority,()=>{
    console.log("BLOCK")
})

unstable_scheduleCallback(ImmediatePriority,()=>{
    console.log("IMMEDIATE")
})