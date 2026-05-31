// Preset department list - used by employee provisioning and (Part B) agent
// scoping. A fixed list keeps filtering + the demo clean; can be made
// org-configurable later.
export const DEPARTMENTS = [
  "Engineering",
  "IT",
  "Data & Analytics",
  "Product",
  "Finance",
  "HR",
  "Legal",
  "Marketing",
  "Sales",
  "Operations",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export function isDepartment(value: string): value is Department {
  return (DEPARTMENTS as readonly string[]).includes(value);
}
