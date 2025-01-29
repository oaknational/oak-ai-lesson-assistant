declare module "gleap" {
  interface GleapInstance {
    initialized: boolean;
    // Add other methods and properties as needed
  }

  const Gleap: {
    getInstance(): GleapInstance;
    setFrameUrl(url: string): void;
    setApiUrl(url: string): void;
    initialize(apiKey: string): void;
    showFeedbackButton(show: boolean): void;
    identify(userId: string, userData: object): void;
    clearIdentity(): void;
  };

  export default Gleap;
}
