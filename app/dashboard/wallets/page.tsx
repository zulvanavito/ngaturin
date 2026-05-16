import { getWallets } from "@/lib/dal";
import { WalletsClientView } from "./wallets-client-view";
import { WalletData } from "@/components/wallets/wallet-card";

export default async function WalletsPage() {
  const wallets = await getWallets();

  return <WalletsClientView initialWallets={wallets as WalletData[]} />;
}
