export interface Arm {
    arm_name: string,
    arm_status: string,
    arm_description: string,
    arm_eligibility: string,
    arm_code?: string,
    arm_internal_id?: string,
    arm_suspended?: string,
    match: Array<object>
}
