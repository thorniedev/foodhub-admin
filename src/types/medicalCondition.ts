export interface MedicalCondition {
  uuid: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  updatedAt: string;
}

export interface MedicalConditionPayload {
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface MedicalConditionFormValues {
  code: string;
  name: string;
  description: string;
  active: boolean;
}
