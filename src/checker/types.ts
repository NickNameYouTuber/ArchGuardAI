export interface Violation {
  rule: "cannot-call" | "cannot-import" | "not-allowed-call";
  file: string;
  sourceLayer: string;
  import: string;
  targetLayer?: string;
  message: string;
}

export interface Diagnostic {
  type: "overlapping-layers" | "unclassified-file";
  severity: "error" | "warning";
  file: string;
  layers?: string[];
  message: string;
}

export interface CheckResult {
  checkedFiles: number;
  violations: Violation[];
  diagnostics: Diagnostic[];
}
