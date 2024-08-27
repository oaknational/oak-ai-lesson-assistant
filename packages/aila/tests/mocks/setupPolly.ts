import NodeHttpAdapter from "@pollyjs/adapter-node-http";
import { Polly } from "@pollyjs/core";
import FSPersister from "@pollyjs/persister-fs";

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

export const setupPolly = () => {
  return new Polly("Aila", {
    adapters: ["node-http"],
    persister: "fs",
    persisterOptions: {
      fs: {
        recordingsDir: "recordings",
      },
    },
    //logging: true,
    recordIfMissing: true,
  });
};
