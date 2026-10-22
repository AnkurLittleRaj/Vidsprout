import { serve } from 'inngest/next';
import { renderWorkflow, reconcileWorkflow } from '@/lib/workflows';
import { inngest } from '@/lib/events';
export const runtime='nodejs';
export const maxDuration=300;
export const {GET,POST,PUT}=serve({client:inngest,functions:[renderWorkflow,reconcileWorkflow]});
