import { auth, slides } from "@googleapis/slides";

import { credentials } from "../credentials";

const myAuth = new auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/presentations",
    "https://www.googleapis.com/auth/presentations.readonly",
  ],
});

export const googleSlides = slides({
  version: "v1",
  auth: myAuth,
});
