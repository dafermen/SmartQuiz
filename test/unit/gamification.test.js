import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  calculateQuizXp,
  getLevelFromXp,
  getLevelProgress
} from "@/components/gamification/gamification";

describe("gamification", () => {
  it("calculates level boundaries and progress", () => {
    expect(getLevelFromXp(-10)).toBe(1);
    expect(getLevelFromXp(249)).toBe(1);
    expect(getLevelFromXp(250)).toBe(2);
    expect(getLevelProgress(375)).toEqual({
      currentLevelXp: 125,
      xpForNextLevel: 250,
      percentage: 50
    });
  });

  it("rewards completion, difficulty, passing and a perfect score", () => {
    const result = calculateQuizXp({
      percentage: 100,
      passed: true,
      answerResults: [
        { is_correct: true, difficulty: "advanced" },
        { is_correct: true, difficulty: "intermediate" },
        { is_correct: false, difficulty: "advanced" }
      ]
    });

    expect(result.earnedXp).toBe(93);
    expect(result.breakdown.map((item) => item.key)).toEqual([
      "completedQuizXp",
      "correctAnswersXp",
      "intermediateBonusXp",
      "advancedBonusXp",
      "passingBonusXp",
      "highScoreBonusXp",
      "perfectScoreBonusXp"
    ]);
  });

  it("never creates a level below one or progress outside 0..100", () => {
    fc.assert(fc.property(fc.integer({ min: -100000, max: 1000000 }), (xp) => {
      const progress = getLevelProgress(xp);
      expect(getLevelFromXp(xp)).toBeGreaterThanOrEqual(1);
      expect(progress.percentage).toBeGreaterThanOrEqual(0);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    }));
  });
});
