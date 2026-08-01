import type { Milestone } from "./types";

// Authoritative default goal set — §3.1 of the build spec (ship verbatim).
export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 1, bf: 33, name: "Pre-mile 1", bmi: 30.0, weight: 89, waist: 43.1, flag: null, what_changes: "Face looks fullest and softest here. Chest looks heaviest, the lower belly is most pronounced, and love handles are at their largest." },
  { id: 2, bf: 32, name: "Pre-mile 2", bmi: 29.7, weight: 88, waist: 42.7, flag: null, what_changes: "Face starts to depuff a little. Neck looks slightly slimmer, and the chest looks a bit less heavy from the side." },
  { id: 3, bf: 31, name: "Pre-mile 3", bmi: 29.3, weight: 87, waist: 42.2, flag: null, what_changes: "Roundness in the face starts easing off. Lower-back softness begins to reduce, and love handles shrink slightly." },
  { id: 4, bf: 30, name: "Milestone 1", bmi: 29.0, weight: 86, waist: 41.7, flag: null, what_changes: "Waist shows the first subtle drop from the side. Chest sits a little flatter in T-shirts, and the upper back looks a bit less soft." },
  { id: 5, bf: 29, name: "Milestone 2", bmi: 28.7, weight: 85, waist: 41.3, flag: null, what_changes: "Waistline becomes a little more noticeable. Chest has less bounce, and the lower back and hip area start to look slightly smaller." },
  { id: 6, bf: 29, name: "Milestone 3", bmi: 28.3, weight: 84, waist: 40.7, flag: null, what_changes: "Jawline looks a bit less blurred. The chest is still soft, but the outline is smaller, and the lower stomach does not dominate quite as much." },
  { id: 7, bf: 28, name: "Milestone 4", bmi: 28.0, weight: 83, waist: 40.2, flag: null, what_changes: "Face looks visibly less puffy. Neck looks cleaner, and the chest appears lighter from the side." },
  { id: 8, bf: 27, name: "Milestone 5", bmi: 27.7, weight: 82, waist: 39.8, flag: null, what_changes: "Love handles are clearly smaller now. The lower back looks less thick, and the face is noticeably less round." },
  { id: 9, bf: 26, name: "Milestone 6", bmi: 27.3, weight: 81, waist: 39.4, flag: null, what_changes: "This is when people start noticing that you've lost weight. Chest looks flatter in T-shirts, waist starts to come in with less of a blocky look." },
  { id: 10, bf: 25, name: "Milestone 7", bmi: 27.0, weight: 80, waist: 38.8, flag: null, what_changes: "Waist comes in more clearly now. The chest moves less, upper-back softness is down, and clothes stop hanging in a square, blocky way." },
  { id: 11, bf: 24, name: "Milestone 8", bmi: 26.6, weight: 79, waist: 38.3, flag: "🔥", what_changes: "Face looks leaner in normal light. Shoulders start showing more shape, and the lower back and hip area look smaller." },
  { id: 12, bf: 23, name: "Milestone 9", bmi: 26.3, weight: 78, waist: 37.8, flag: null, what_changes: "Jawline starts showing without needing perfect lighting. Arms look firmer, and back fat loss becomes noticeable." },
  { id: 13, bf: 22, name: "Milestone 10", bmi: 26.0, weight: 77, waist: 37.3, flag: "💪", what_changes: "Shoulders look more defined, the chest appears flatter overall, and the waist looks smaller from the front." },
  { id: 14, bf: 21, name: "Milestone 11", bmi: 25.6, weight: 76, waist: 36.8, flag: null, what_changes: "Love handles are clearly reduced. Arms look leaner, the face looks sharper, and the torso starts reading as more athletic than soft." },
  { id: 15, bf: 20, name: "Milestone 12", bmi: 25.3, weight: 75, waist: 36.4, flag: null, what_changes: "This is a major confidence milestone for people. no more soft or rounded look in normal posture, it looks flat in thin shirts, and less drop" },
  { id: 16, bf: 19, name: "Milestone 13", bmi: 25.0, weight: 74, waist: 35.9, flag: "✨", what_changes: "Upper abs begin showing in good lighting. Thighs look slimmer, love handles are much smaller, and the waist looks noticeably tighter." },
  { id: 17, bf: 18, name: "Milestone 14", bmi: 24.6, weight: 73, waist: 35.4, flag: null, what_changes: "This is the lean look most people aim for. Upper abs start become visible, even if faint, there is a clear V-taper the shoulders wider than waist." },
  { id: 18, bf: 17, name: "Milestone 15", bmi: 24.3, weight: 72, waist: 35.0, flag: null, what_changes: "Lower abs look much flatter. V-lines become visible, and forearm veins start showing more often." },
  { id: 19, bf: 16, name: "Milestone 16", bmi: 23.9, weight: 71, waist: 34.5, flag: "🏆", what_changes: "This is point most people say, \"you look really fit.\" It has an athletic, in-shape look, with muscle visible without flexing and a sharp, lean face." },
  { id: 20, bf: 14, name: "Milestone 17", bmi: 23.6, weight: 70, waist: 34.0, flag: null, what_changes: "Upper abs are clearly visible. Lower abs show in good lighting, and the fat pad above the pelvic area is much smaller." },
  { id: 21, bf: 13, name: "Milestone 18", bmi: 23.3, weight: 69, waist: 33.5, flag: "🔥", what_changes: "This is the classic fitness model look.physique is very lean and aesthetic, with obvious muscle separation and a very sharp, cut-looking face." },
];
