/// Not sure this should live here or if this is the right approach
// Handles manually resetting the store around aila
import { useChatStore } from "..";

const useStoreReset = ({ id }: { id: string | null }) => {
  const idFromStore = useChatStore((state) => state.id);
  const reset = useChatStore((state) => state.reset);
  if (!id || id !== idFromStore) {
    return reset();
  }
  return null;
};

export default useStoreReset;
