import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, Copy, ExternalLink, RefreshCw } from "lucide-react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Wallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [connector, setConnector] = useState<WalletConnect | null>(null);
  const [chainId, setChainId] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [networkName, setNetworkName] = useState<string>("");
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [quickLoginCode, setQuickLoginCode] = useState("");

  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: "Ethereum Mainnet",
      56: "BSC Mainnet",
      137: "Polygon",
      43114: "Avalanche",
      250: "Fantom",
      42161: "Arbitrum",
      10: "Optimism",
      8453: "Base",
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const getRpcUrl = (chainId: number): string => {
    const rpcUrls: { [key: number]: string } = {
      1: "https://eth.llamarpc.com",
      56: "https://bsc-dataseed.binance.org",
      137: "https://polygon-rpc.com",
      43114: "https://api.avax.network/ext/bc/C/rpc",
      250: "https://rpc.ftm.tools",
      42161: "https://arb1.arbitrum.io/rpc",
      10: "https://mainnet.optimism.io",
      8453: "https://mainnet.base.org",
    };
    return rpcUrls[chainId] || "";
  };

  const fetchBalance = async (address: string, chain: number) => {
    try {
      setIsLoadingBalance(true);
      const rpcUrl = getRpcUrl(chain);
      
      if (!rpcUrl) {
        console.error("Unsupported network");
        toast.error("Mạng không được hỗ trợ!");
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = parseFloat(ethers.utils.formatEther(balanceWei));
      
      setBalance(balanceEth);
      setNetworkName(getNetworkName(chain));
      console.log(`Balance fetched: ${balanceEth} for ${getNetworkName(chain)}`);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Không thể lấy số dư!");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const bridge = "https://bridge.walletconnect.org";
      const walletConnector = new WalletConnect({ 
        bridge, 
        qrcodeModal: QRCodeModal 
      });

      if (!walletConnector.connected) {
        await walletConnector.createSession();
      } else {
        const { chainId: connectedChainId, accounts } = walletConnector;
        setWalletAddress(accounts[0]);
        setChainId(connectedChainId);
        setIsConnected(true);
        await fetchBalance(accounts[0], connectedChainId);
        toast.success("Đã kết nối ví BiggetWallet thành công!");
      }

      setConnector(walletConnector);

      // Setup event listeners
      walletConnector.on("connect", async (error, payload) => {
        if (error) {
          console.error("Connection error:", error);
          toast.error("Lỗi kết nối ví!");
          return;
        }
        const { accounts, chainId: connectedChainId } = payload.params[0];
        setWalletAddress(accounts[0]);
        setChainId(connectedChainId);
        setIsConnected(true);
        await fetchBalance(accounts[0], connectedChainId);
        toast.success("Đã kết nối ví BiggetWallet thành công!");
      });

      walletConnector.on("session_update", async (error, payload) => {
        if (error) {
          console.error("Session update error:", error);
          return;
        }
        const { accounts, chainId: connectedChainId } = payload.params[0];
        setWalletAddress(accounts[0]);
        setChainId(connectedChainId);
        await fetchBalance(accounts[0], connectedChainId);
        toast.info("Đã cập nhật phiên!");
      });

      walletConnector.on("disconnect", (error) => {
        if (error) {
          console.error("Disconnect error:", error);
        }
        setIsConnected(false);
        setWalletAddress("");
        setBalance(0);
        setNetworkName("");
        toast.info("Đã ngắt kết nối ví!");
      });
    } catch (error) {
      console.error("WalletConnect error:", error);
      toast.error("Không thể kết nối ví!");
    }
  };

  const handleRefreshBalance = async () => {
    if (walletAddress && chainId) {
      await fetchBalance(walletAddress, chainId);
      toast.success("Đã cập nhật số dư!");
    }
  };

  useEffect(() => {
    return () => {
      if (connector && connector.connected) {
        connector.killSession();
      }
    };
  }, [connector]);

  const handleQuickLogin = () => {
    if (quickLoginCode.length < 1 || quickLoginCode.length > 2) {
      toast.error("Vui lòng nhập mã 1-2 ký tự!");
      return;
    }
    
    // Giả lập kết nối với mã PIN
    const mockAddress = `0x${quickLoginCode.padEnd(40, '0')}`;
    setWalletAddress(mockAddress);
    setChainId(1);
    setIsConnected(true);
    setBalance(Math.random() * 10);
    setNetworkName("Ethereum Mainnet");
    setShowQuickLogin(false);
    setQuickLoginCode("");
    toast.success("Đã đăng nhập BiggetWallet thành công!");
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Đã sao chép địa chỉ ví!");
  };

  const handleSend = () => {
    if (!sendAmount || !sendAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    const amount = parseFloat(sendAmount);
    if (amount > balance) {
      toast.error("Số dư không đủ!");
      return;
    }

    setBalance(balance - amount);
    toast.success(`Đã gửi $${amount} thành công!`);
    setSendAmount("");
    setSendAddress("");
    setShowSendDialog(false);
  };

  const transactions = [
    {
      id: 1,
      type: "send",
      amount: 100,
      to: "Doraemon",
      date: "2 giờ trước",
      status: "completed"
    },
    {
      id: 2,
      type: "receive",
      amount: 250,
      from: "Nguyễn Thị Thanh Tiên",
      date: "1 ngày trước",
      status: "completed"
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <Card className="text-center p-8">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <WalletIcon className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="mb-2 flex items-center justify-center gap-2">
              <WalletIcon className="h-6 w-6" />
              Ví của tôi
            </CardTitle>
            <p className="text-muted-foreground mb-6">Kết nối với BiggetWallet để bắt đầu</p>
            <div className="space-y-3">
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-primary hover:bg-primary/90 gap-2"
              >
                <WalletIcon className="h-4 w-4" />
                Kết nối BiggetWallet
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">hoặc</span>
                </div>
              </div>

              <Dialog open={showQuickLogin} onOpenChange={setShowQuickLogin}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    Đăng nhập nhanh (1-2 ký tự)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Đăng nhập nhanh BiggetWallet</DialogTitle>
                    <DialogDescription>
                      Nhập mã PIN (1-2 ký tự) của bạn để đăng nhập
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="quick-code">Mã PIN BiggetWallet</Label>
                      <Input
                        id="quick-code"
                        placeholder="Nhập 1-2 ký tự"
                        value={quickLoginCode}
                        onChange={(e) => setQuickLoginCode(e.target.value.slice(0, 2))}
                        maxLength={2}
                        className="text-center text-2xl font-bold tracking-widest"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Mã PIN giúp bạn truy cập nhanh vào ví
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowQuickLogin(false);
                        setQuickLoginCode("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={handleQuickLogin}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <WalletIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ví của tôi</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <WalletIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground truncate">{walletAddress}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleCopyAddress}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
                  {networkName && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {networkName}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-4xl font-bold text-foreground">
                    {isLoadingBalance ? "..." : balance.toFixed(6)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshBalance}
                    disabled={isLoadingBalance}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {networkName ? "Native token balance" : ""}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      <ArrowUpRight className="h-4 w-4" />
                      Gửi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gửi tiền</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin người nhận và số tiền cần gửi
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="send-address">Địa chỉ ví người nhận</Label>
                        <Input
                          id="send-address"
                          placeholder="0x..."
                          value={sendAddress}
                          onChange={(e) => setSendAddress(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="send-amount">Số tiền ($)</Label>
                        <Input
                          id="send-amount"
                          type="number"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Số dư hiện tại: ${balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowSendDialog(false)}
                      >
                        Hủy
                      </Button>
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={handleSend}
                      >
                        Gửi ngay
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <ArrowDownLeft className="h-4 w-4" />
                      Nhận
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nhận tiền</DialogTitle>
                      <DialogDescription>
                        Chia sẻ địa chỉ ví của bạn để nhận tiền
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="p-6 bg-muted/30 rounded-lg text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <WalletIcon className="h-5 w-5 text-primary" />
                          <p className="text-sm font-medium">BiggetWallet</p>
                        </div>
                        <p className="text-sm break-all font-mono">{walletAddress}</p>
                        <Button 
                          variant="outline" 
                          className="gap-2 w-full"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="h-4 w-4" />
                          Sao chép địa chỉ
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Chỉ gửi tài sản tương thích với BiggetWallet đến địa chỉ này
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lịch sử giao dịch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === "send" ? "bg-red-500/10" : "bg-green-500/10"
                      }`}>
                        {tx.type === "send" ? (
                          <ArrowUpRight className={`h-5 w-5 text-red-500`} />
                        ) : (
                          <ArrowDownLeft className={`h-5 w-5 text-green-500`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {tx.type === "send" ? "Đã gửi" : "Đã nhận"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.type === "send" ? `Đến ${tx.to}` : `Từ ${tx.from}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === "send" ? "text-red-500" : "text-green-500"
                      }`}>
                        {tx.type === "send" ? "-" : "+"}${tx.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Chưa có giao dịch nào
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
