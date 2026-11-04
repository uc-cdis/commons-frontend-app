import { describe, expect, it } from "vitest";
import { modelNames, modelToSend } from "./models";

describe("modelNames", () => {
  it("keeps each name once, in order", () => {
    expect(modelNames(["Muse", "Haiku", "Muse"])).toEqual(["Muse", "Haiku"]);
  });

  it("drops what isn't a name", () => {
    expect(modelNames(["Muse", 3, null, { alias: "x" }])).toEqual(["Muse"]);
  });

  it("gives none for anything but a list", () => {
    expect(modelNames(undefined)).toEqual([]);
    expect(modelNames({ backends: ["Muse"] })).toEqual([]);
  });
});

describe("modelToSend", () => {
  const models = ["Muse", "Haiku"];

  it("sends the saved pick unchecked until the list loads", () => {
    expect(modelToSend([], "Haiku")).toBe("Haiku");
    expect(modelToSend([], undefined)).toBeUndefined();
  });

  it("sends the saved pick when the agent offers it", () => {
    expect(modelToSend(models, "Haiku")).toBe("Haiku");
  });

  it("sends the agent's first model when nothing is saved or the pick is gone", () => {
    expect(modelToSend(models, undefined)).toBe("Muse");
    expect(modelToSend(models, "Removed")).toBe("Muse");
  });
});
