export interface Arm {
    arm_code: string, // The 1st word of arm_description.
    arm_description: string, // Arm full name.
    arm_internal_id: string, // Used for matchminer backend.
    arm_suspended: string, // Arm status(Y/N).
    arm_eligibility?: string, // Store in Firebase and do not send to MongoDB.
    arm_info?: string, // Real arm description. Store in Firebase and do not send to MongoDB.
    match: Array<object>
}
