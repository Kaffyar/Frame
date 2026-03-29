import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges duplicate Tailwind classes", () => {
    expect(cn("px-2 py-4", "px-6")).toBe("py-4 px-6");
  });

  it("ignores falsey values while preserving valid classes", () => {
    const optionalClass: string | undefined = undefined;

    expect(cn("text-sm", optionalClass, "font-light")).toBe("text-sm font-light");
  });
});
