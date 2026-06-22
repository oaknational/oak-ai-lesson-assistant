import type { StructuralItemIntent } from "../schema";
import {
  type RunSingleItemFn,
  type SectionListDispatchOptions,
  sectionListOperationDispatcher,
} from "./sectionListOperationDispatcher";

type Item = { id: string };

const opts: SectionListDispatchOptions = {
  itemNoun: "keyword",
  min: 1,
  max: 5,
  regenerateSuggestion: "redo the keywords",
};

const i1: Item = { id: "one" };
const i2: Item = { id: "two" };
const i3: Item = { id: "three" };

const noAgent: RunSingleItemFn<Item> = jest.fn();

describe("sectionListOperationDispatcher", () => {
  describe("removing an item", () => {
    const remove = (position: number | null): StructuralItemIntent => ({
      action: "REMOVE_ITEM",
      position,
    });

    it("removes the item at the given position and keeps the others by reference", async () => {
      const items = [i1, i2, i3];
      const result = await sectionListOperationDispatcher(
        items,
        remove(2),
        noAgent,
        opts,
      );

      expect(result.data).toEqual([i1, i3]);
      expect(result.data[0]).toBe(i1);
      expect(result.data[1]).toBe(i3);
      expect(result.note).toBeUndefined();
    });

    it("returns the same array with a note when the position is unknown", async () => {
      const items = [i1, i2, i3];
      const result = await sectionListOperationDispatcher(
        items,
        remove(null),
        noAgent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/which keyword to remove/i);
    });

    it("returns the same array with a note when the position is out of range", async () => {
      const items = [i1, i2];
      const result = await sectionListOperationDispatcher(
        items,
        remove(5),
        noAgent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toContain("2");
    });

    it("refuses to remove the last item below the minimum", async () => {
      const items = [i1];
      const result = await sectionListOperationDispatcher(
        items,
        remove(1),
        noAgent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/at least 1 keyword/i);
    });

    it("never calls the agent", async () => {
      const agent = jest.fn();
      await sectionListOperationDispatcher([i1, i2], remove(1), agent, opts);
      expect(agent).not.toHaveBeenCalled();
    });
  });

  describe("adding an item", () => {
    const add = (position: number | null = null): StructuralItemIntent => ({
      action: "ADD_ITEM",
      position,
    });
    const fresh: Item = { id: "fresh" };

    it("appends the new item when no position is given", async () => {
      const agent = jest.fn().mockResolvedValue(fresh);
      const result = await sectionListOperationDispatcher(
        [i1, i2],
        add(),
        agent,
        opts,
      );

      expect(result.data).toEqual([i1, i2, fresh]);
      expect(result.data[0]).toBe(i1);
    });

    it("inserts at the given position and keeps the others by reference", async () => {
      const agent = jest.fn().mockResolvedValue(fresh);
      const result = await sectionListOperationDispatcher(
        [i1, i2],
        add(2),
        agent,
        opts,
      );

      expect(result.data).toEqual([i1, fresh, i2]);
      expect(result.data[0]).toBe(i1);
      expect(result.data[2]).toBe(i2);
    });

    it("invokes the agent exactly once", async () => {
      const agent = jest.fn().mockResolvedValue(fresh);
      await sectionListOperationDispatcher([i1], add(), agent, opts);
      expect(agent).toHaveBeenCalledTimes(1);
    });

    it("returns the same array with a note when the agent returns null", async () => {
      const items = [i1, i2];
      const agent = jest.fn().mockResolvedValue(null);
      const result = await sectionListOperationDispatcher(
        items,
        add(),
        agent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/trouble adding/i);
    });

    it("refuses to add beyond the maximum without calling the agent", async () => {
      const items = [i1, i2, i3, { id: "four" }, { id: "five" }];
      const agent = jest.fn().mockResolvedValue(fresh);
      const result = await sectionListOperationDispatcher(
        items,
        add(),
        agent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/most this section can hold/i);
      expect(agent).not.toHaveBeenCalled();
    });

    it("returns a note when the insert position is out of range", async () => {
      const agent = jest.fn().mockResolvedValue(fresh);
      const result = await sectionListOperationDispatcher(
        [i1, i2],
        add(0),
        agent,
        opts,
      );

      expect(result.note).toMatch(/valid positions/i);
      expect(agent).not.toHaveBeenCalled();
    });
  });

  describe("changing an item", () => {
    const change = (position: number | null): StructuralItemIntent => ({
      action: "CHANGE_ITEM",
      position,
    });
    const replacement: Item = { id: "replacement" };

    it("replaces the item at the given position and keeps the others by reference", async () => {
      const agent = jest.fn().mockResolvedValue(replacement);
      const result = await sectionListOperationDispatcher(
        [i1, i2, i3],
        change(2),
        agent,
        opts,
      );

      expect(result.data).toEqual([i1, replacement, i3]);
      expect(result.data[0]).toBe(i1);
      expect(result.data[2]).toBe(i3);
    });

    it("invokes the agent exactly once for a valid position", async () => {
      const agent = jest.fn().mockResolvedValue(replacement);
      await sectionListOperationDispatcher(
        [i1, i2, i3],
        change(3),
        agent,
        opts,
      );
      expect(agent).toHaveBeenCalledTimes(1);
    });

    it("returns the same array with a note when the position is unknown", async () => {
      const items = [i1, i2];
      const agent = jest.fn().mockResolvedValue(replacement);
      const result = await sectionListOperationDispatcher(
        items,
        change(null),
        agent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/which keyword to change/i);
      expect(agent).not.toHaveBeenCalled();
    });

    it("returns the same array with a note when the agent returns null", async () => {
      const items = [i1, i2];
      const agent = jest.fn().mockResolvedValue(null);
      const result = await sectionListOperationDispatcher(
        items,
        change(1),
        agent,
        opts,
      );

      expect(result.data).toBe(items);
      expect(result.note).toMatch(/trouble rewriting/i);
    });
  });
});
