class DatabaseState {
  private static instance: DatabaseState;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private initResolvers: (() => void)[] = [];

  private constructor() {
    console.log('📱 DatabaseState instance created');
  }

  static getInstance(): DatabaseState {
    if (!DatabaseState.instance) {
      DatabaseState.instance = new DatabaseState();
    }
    return DatabaseState.instance;
  }

  setInitialized(): void {
    console.log(`🎯 DatabaseState.setInitialized() called. Pending resolvers: ${this.initResolvers.length}`);
    this.isInitialized = true;
    // Resolve all pending promises
    this.initResolvers.forEach(resolve => resolve());
    this.initResolvers = [];
    console.log('✅ All pending database operations have been released');
  }

  async waitForInitialization(): Promise<void> {
    console.log(`⏳ DatabaseState.waitForInitialization() called. Is initialized: ${this.isInitialized}`);
    if (this.isInitialized) {
      console.log('✅ Database already initialized, proceeding immediately');
      return Promise.resolve();
    }

    console.log('⏳ Database not initialized, adding to waiting queue...');
    return new Promise<void>((resolve) => {
      this.initResolvers.push(resolve);
      console.log(`⏳ Added to queue. Total waiting: ${this.initResolvers.length}`);
    });
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  reset(): void {
    console.log('🔄 DatabaseState.reset() called');
    this.isInitialized = false;
    this.initPromise = null;
    this.initResolvers = [];
  }
}

export const dbState = DatabaseState.getInstance();
