declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: "development" | "production";
      ONEBOT_SELF_ID?: string;
      ONEBOT_ENDPOINT?: string;
    }
  }
}

export {};
