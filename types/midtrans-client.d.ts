/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionParameter {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      email?: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
    };
    item_details?: {
      id: string;
      price: number;
      quantity: number;
      name: string;
    }[];
    [key: string]: any;
  }

  interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: TransactionParameter): Promise<TransactionResponse>;
    createTransactionToken(parameter: TransactionParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: TransactionParameter): Promise<string>;
  }

  class CoreApi {
    constructor(options: SnapOptions);
    charge(parameter: any): Promise<any>;
    transaction: {
      status(orderId: string): Promise<any>;
    };
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
