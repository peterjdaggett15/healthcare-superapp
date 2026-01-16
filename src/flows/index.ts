import { findCareFlow } from './find-care';
import { appointmentsFlow } from './appointments';
import { insuranceFlow } from './insurance';
import { comparePricesFlow } from './compare-prices';
import { medicalRecordsFlow } from './medical-records';
import { medicationRefillFlow } from './medication-refill';
import { somethingElseFlow } from './something-else';
import { Flow } from '@/types/flow';

export const flows: Record<string, Flow> = {
  'find-care': findCareFlow,
  'appointments': appointmentsFlow,
  'insurance': insuranceFlow,
  'compare-prices': comparePricesFlow,
  'medical-records': medicalRecordsFlow,
  'medication-refill': medicationRefillFlow,
  'something-else': somethingElseFlow,
};

export {
  findCareFlow,
  appointmentsFlow,
  insuranceFlow,
  comparePricesFlow,
  medicalRecordsFlow,
  medicationRefillFlow,
  somethingElseFlow,
};
