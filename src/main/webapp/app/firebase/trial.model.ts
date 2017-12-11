export interface Trial {
    nct_id: string;
    long_title: string;
    short_title: string;
    phase: string;
    status: string;
    treatment_list: { step: Step; };
}
interface Step {
    match?: Array<Match>;
    arms?: Array<Arm>;
}
interface Arm {
    arm_name: string;
    arm_type: string;
    arm_description: string;
    match?: Array<Match>;
}
interface DoseLevel {
    match?: Array<Match>;
    level_internal_id: number;
    level_code: string;
    level_description: string;
    level_suspended: string;
}
interface Match { }
