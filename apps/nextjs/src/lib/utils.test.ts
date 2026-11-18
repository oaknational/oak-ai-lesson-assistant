import { cn } from "./utils";

// tailwind-merge has no access to our theme, so these use the app's custom names
describe("cn", () => {
  it("keeps both classes when a font size meets a custom text colour", () => {
    expect(cn("text-sm", "text-default")).toBe("text-sm text-default");
    expect(cn("text-sm", "text-grey7")).toBe("text-sm text-grey7");
  });

  it("keeps the last font size when sizes conflict", () => {
    expect(cn("text-md", "text-lg")).toBe("text-lg");
    expect(cn("text-lg", "text-md")).toBe("text-md");
  });

  it("keeps the last custom colour when colours conflict", () => {
    expect(cn("bg-pupilsLimeGreen", "bg-white")).toBe("bg-white");
    expect(cn("text-black", "text-pupilsHighlight")).toBe(
      "text-pupilsHighlight",
    );
  });

  it("keeps the last value when spacing or radius conflict", () => {
    expect(cn("p-4", "p-10")).toBe("p-10");
    expect(cn("rounded-sm", "rounded-lg")).toBe("rounded-lg");
  });

  it("keeps both classes when a border width meets a custom border colour", () => {
    expect(cn("border", "border-grey3")).toBe("border border-grey3");
  });

  it("drops falsy values", () => {
    const isActive = false;
    expect(cn("p-4", isActive && "p-10")).toBe("p-4");
  });
});
