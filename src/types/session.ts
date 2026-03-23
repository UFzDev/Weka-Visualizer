export interface ModelSession {
  id: string;
  name: string;
  trainText: string;
  testText: string;
}

export type TabType = 'train' | 'test' | 'compare' | 'global-compare';
