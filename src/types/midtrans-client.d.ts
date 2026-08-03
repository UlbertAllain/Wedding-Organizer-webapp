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

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: Record<string, unknown>): Promise<TransactionResponse>;
  }

  const midtransClient: { Snap: typeof Snap };
  export default midtransClient;
}
