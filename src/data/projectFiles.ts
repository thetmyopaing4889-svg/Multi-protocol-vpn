import { PHASE_1_FILES } from './phase1Files';
import { PHASE_2_FILES } from './phase2Files';
import { PHASE_3_FILES } from './phase3Files';
import { PHASE_4_FILES } from './phase4Files';
import { PHASE_5_FILES } from './phase5Files';
import { FileEntry } from '../types';

export const ALL_PROJECT_FILES: FileEntry[] = [
  ...PHASE_1_FILES.map(f => ({ ...f, phase: 'Phase 1' as const })),
  ...PHASE_2_FILES,
  ...PHASE_3_FILES,
  ...PHASE_4_FILES,
  ...PHASE_5_FILES
];

export { PHASE_1_FILES, PHASE_2_FILES, PHASE_3_FILES, PHASE_4_FILES, PHASE_5_FILES };
