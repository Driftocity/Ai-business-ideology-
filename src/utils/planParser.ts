import { PlanSection } from "../types";

export function parsePlan(text: string): PlanSection[] {
  const labels = [
    "REVENUE MODEL",
    "PRICING STRATEGY",
    "90-DAY LAUNCH ROADMAP",
    "COMPETITOR LANDSCAPE",
    "YOUR UNIQUE ANGLE",
    "MARKETING CHANNELS",
    "FIRST 5 ACTION STEPS"
  ];
  const results: PlanSection[] = [];

  labels.forEach((label, i) => {
    const regex = new RegExp(label + ":\\s*", "i");
    const match = text.search(regex);
    if (match === -1) return;
    
    // Get everything after the current label
    const after = text.slice(match).replace(regex, "");
    let content = after;
    
    // Find if any of the remaining labels appear after this match
    const nextLabel = labels.slice(i + 1).find(l => new RegExp(l + ":", "i").test(after));
    if (nextLabel) {
      const cut = after.search(new RegExp(nextLabel + ":", "i"));
      if (cut > -1) {
        content = after.slice(0, cut);
      }
    }
    
    // Convert label in all caps to a nicely formatted title (e.g., "Revenue Model")
    const formattedTitle = label
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    results.push({
      title: formattedTitle,
      content: content.trim()
    });
  });

  return results.length ? results : [{ title: "Your Complete Business Plan", content: text }];
}
