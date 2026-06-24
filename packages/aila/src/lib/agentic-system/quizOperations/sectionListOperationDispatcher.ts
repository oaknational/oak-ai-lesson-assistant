import type { StructuralItemIntent } from "../schema";

export type RunSingleItemFn<T> = () => Promise<T | null>;

export type SectionListDispatchResult<T> = {
  data: T[];
  note?: string;
};

export type SectionListDispatchOptions = {
  /** Singular noun used in user-facing notes, e.g. "question", "keyword". */
  itemNoun: string;
  /** Fewest items the section may hold; REMOVE is refused at or below this. */
  min: number;
  /** Most items the section may hold; ADD is refused at or above this. */
  max: number;
  /** What to suggest when a single-item edit fails, e.g. "Generate a new quiz". */
  regenerateSuggestion: string;
};

/**
 * Section-agnostic add/remove/change over a list of items. REMOVE is deterministic
 * (no agent); ADD/CHANGE call runSingleItem once. Untouched items are carried over
 * by reference (slice), so they stay byte-preserved, and a declined edit returns the
 * original array unchanged
 */
export async function sectionListOperationDispatcher<T>(
  items: T[],
  intent: StructuralItemIntent,
  runSingleItem: RunSingleItemFn<T>,
  opts: SectionListDispatchOptions,
): Promise<SectionListDispatchResult<T>> {
  switch (intent.action) {
    case "REMOVE_ITEM":
      return handleRemove(items, intent, opts);
    case "ADD_ITEM":
      return handleAdd(items, intent, runSingleItem, opts);
    case "CHANGE_ITEM":
      return handleChange(items, intent, runSingleItem, opts);
  }
}

function handleRemove<T>(
  items: T[],
  intent: StructuralItemIntent,
  opts: SectionListDispatchOptions,
): SectionListDispatchResult<T> {
  const { position } = intent;
  const { itemNoun } = opts;

  if (position === null) {
    return {
      data: items,
      note: `I'm not sure which ${itemNoun} to remove — could you say '${itemNoun} 3' for example?`,
    };
  }

  if (position < 1 || position > items.length) {
    return {
      data: items,
      note: `You asked to remove ${itemNoun} ${position}, but there are only ${items.length} ${itemNoun}s.`,
    };
  }

  if (items.length <= opts.min) {
    return {
      data: items,
      note: `A lesson needs at least ${opts.min} ${itemNoun}${opts.min === 1 ? "" : "s"}, so I can't remove that one.`,
    };
  }

  return {
    data: [...items.slice(0, position - 1), ...items.slice(position)],
  };
}

async function handleAdd<T>(
  items: T[],
  intent: StructuralItemIntent,
  runSingleItem: RunSingleItemFn<T>,
  opts: SectionListDispatchOptions,
): Promise<SectionListDispatchResult<T>> {
  const { itemNoun } = opts;
  const insertAt = intent.position ?? items.length + 1;

  if (insertAt < 1 || insertAt > items.length + 1) {
    return {
      data: items,
      note: `You asked to add a ${itemNoun} at position ${insertAt}, but valid positions are 1 to ${items.length + 1}.`,
    };
  }

  if (items.length >= opts.max) {
    return {
      data: items,
      note: `There are already ${items.length} ${itemNoun}s, which is the most this section can hold. Remove one first, or ask me to redo them.`,
    };
  }

  const newItem = await runSingleItem();
  if (!newItem) {
    return {
      data: items,
      note: `I had trouble adding a single ${itemNoun}. You could try '${opts.regenerateSuggestion}' for a fresh set.`,
    };
  }

  return {
    data: [
      ...items.slice(0, insertAt - 1),
      newItem,
      ...items.slice(insertAt - 1),
    ],
  };
}

async function handleChange<T>(
  items: T[],
  intent: StructuralItemIntent,
  runSingleItem: RunSingleItemFn<T>,
  opts: SectionListDispatchOptions,
): Promise<SectionListDispatchResult<T>> {
  const { position } = intent;
  const { itemNoun } = opts;

  if (position === null) {
    return {
      data: items,
      note: `I'm not sure which ${itemNoun} to change — could you say '${itemNoun} 3' for example?`,
    };
  }

  if (position < 1 || position > items.length) {
    return {
      data: items,
      note: `You asked to change ${itemNoun} ${position}, but there are only ${items.length} ${itemNoun}s.`,
    };
  }

  const replacement = await runSingleItem();
  if (!replacement) {
    return {
      data: items,
      note: `I had trouble rewriting just that ${itemNoun}. You could try '${opts.regenerateSuggestion}' for a fresh set.`,
    };
  }

  return {
    data: [
      ...items.slice(0, position - 1),
      replacement,
      ...items.slice(position),
    ],
  };
}
