declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  interface SnapInstance {
    createTransaction(
      parameter: Record<string, unknown>,
    ): Promise<TransactionResponse>;
  }

  interface SnapConstructor {
    new (options: SnapOptions): SnapInstance;
  }

  const midtransClient: { Snap: SnapConstructor };
  export default midtransClient;
}
