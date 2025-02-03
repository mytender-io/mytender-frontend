export function truncateName(name: string, maxLength: number): string {
  if (name.length > maxLength) {
    return name.slice(0, maxLength - 3) + "...";
  }
  return name;
}
