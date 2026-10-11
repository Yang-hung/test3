export interface DecisionOption {
  id: string;
  text: string;
  color?: string;
}

export type DecisionMode = 'rps' | 'fortune' | 'wheel';

export interface PresetScenario {
  title: string;
  icon: string;
  description: string;
  options: string[];
}
