import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, Copy, ExternalLink, RefreshCw, TrendingUp, TrendingDown, History, Settings, Eye, EyeOff, ArrowLeftRight, DollarSign, BarChart3 } from "lucide-react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  const [hideBalance, setHideBalance] = useState(false);
  
  // Mock tokens data
  const [tokens] = useState([
    { symbol: "ETH", name: "Ethereum", balance: 2.5, price: 2340.50, change: 2.5, icon: "🔷" },
    { symbol: "BTC", name: "Bitcoin", balance: 0.15, price: 43200.00, change: -1.2, icon: "🟠" },
    { symbol: "USDT", name: "Tether", balance: 5000, price: 1.00, change: 0.0, icon: "💚" },
    { symbol: "BNB", name: "BNB", balance: 8.3, price: 312.45, change: 3.8, icon: "🟡" },
  ]);

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
    if (quickLoginCode.length !== 12) {
      toast.error("Vui lòng nhập đúng 12 ký tự!");
      return;
    }
    
    // Giả lập kết nối với mã PIN 12 ký tự
    const mockAddress = `0x${quickLoginCode.repeat(4).slice(0, 40)}`;
    setWalletAddress(mockAddress);
    setChainId(1);
    setIsConnected(true);
    setBalance(12500.75);
    setNetworkName("Ethereum Mainnet");
    setShowQuickLogin(false);
    setQuickLoginCode("");
    toast.success("Đã đăng nhập BiggetWallet thành công!");
  };
  
  const getTotalPortfolioValue = () => {
    return tokens.reduce((total, token) => total + (token.balance * token.price), 0);
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
      amount: 0.5,
      token: "ETH",
      to: "0x742d...3f4a",
      date: "2 giờ trước",
      status: "completed",
      hash: "0xabc...def"
    },
    {
      id: 2,
      type: "receive",
      amount: 1000,
      token: "USDT",
      from: "0x8a3c...9b2d",
      date: "5 giờ trước",
      status: "completed",
      hash: "0x123...456"
    },
    {
      id: 3,
      type: "swap",
      amount: 0.1,
      token: "BTC",
      from: "ETH",
      date: "1 ngày trước",
      status: "completed",
      hash: "0x789...abc"
    },
    {
      id: 4,
      type: "send",
      amount: 2.5,
      token: "BNB",
      to: "0x5f2a...8c1d",
      date: "2 ngày trước",
      status: "pending",
      hash: "0xdef...789"
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center p-8 shadow-xl border-2 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <WalletIcon className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="mb-3 text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BiggetWallet
            </CardTitle>
            <p className="text-muted-foreground mb-8">Kết nối ví để quản lý tài sản crypto của bạn</p>
            <div className="space-y-4">
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2 h-12 text-base font-semibold shadow-lg"
              >
                <WalletIcon className="h-5 w-5" />
                Kết nối WalletConnect
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">hoặc</span>
                </div>
              </div>

              <Dialog open={showQuickLogin} onOpenChange={setShowQuickLogin}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12 border-2 hover:border-primary hover:bg-primary/5">
                    <DollarSign className="h-5 w-5" />
                    Đăng nhập nhanh (12 ký tự)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <WalletIcon className="h-6 w-6 text-primary" />
                      Đăng nhập nhanh
                    </DialogTitle>
                    <DialogDescription>
                      Nhập mã PIN 12 ký tự của bạn để truy cập ví
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <Label htmlFor="quick-code" className="text-base font-semibold">Mã PIN BiggetWallet</Label>
                      <Input
                        id="quick-code"
                        placeholder="Nhập 12 ký tự..."
                        value={quickLoginCode}
                        onChange={(e) => setQuickLoginCode(e.target.value.slice(0, 12))}
                        maxLength={12}
                        className="text-center text-xl font-bold tracking-wider h-14 border-2 focus:border-primary"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Đã nhập: {quickLoginCode.length}/12</span>
                        {quickLoginCode.length === 12 && (
                          <Badge variant="default" className="animate-scale-in">✓ Đủ ký tự</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
                        🔒 Mã PIN 12 ký tự giúp bảo mật và truy cập nhanh vào ví của bạn
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-11"
                      onClick={() => {
                        setShowQuickLogin(false);
                        setQuickLoginCode("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      className="flex-1 h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold"
                      onClick={handleQuickLogin}
                      disabled={quickLoginCode.length !== 12}
                    >
                      Đăng nhập
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>🔐 An toàn & Bảo mật</p>
              <p>Được bảo vệ bởi công nghệ blockchain</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <WalletIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">BiggetWallet</h1>
              <p className="text-sm text-muted-foreground">Quản lý tài sản crypto</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Portfolio Card */}
        <Card className="shadow-xl border-2 animate-fade-in">
          <CardContent className="pt-6">
            {/* Wallet Address */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <WalletIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground truncate font-mono">{walletAddress}</p>
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

            {/* Total Balance */}
            <div className="text-center space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Tổng tài sản</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setHideBalance(!hideBalance)}
                >
                  {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {networkName && (
                  <Badge variant="secondary" className="text-xs">
                    {networkName}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-center gap-3">
                <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {hideBalance ? "****" : `$${getTotalPortfolioValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
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
              <div className="flex items-center justify-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500 font-semibold">+$1,234.56 (12.5%)</span>
                <span className="text-muted-foreground">hôm nay</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-col h-auto py-4 gap-2 bg-gradient-to-br from-primary to-accent hover:opacity-90">
                    <ArrowUpRight className="h-5 w-5" />
                    <span className="text-xs font-semibold">Gửi</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                      Gửi tiền
                    </DialogTitle>
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
                        className="font-mono"
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
                        Số dư hiện tại: ${getTotalPortfolioValue().toLocaleString()}
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
                      className="flex-1 bg-gradient-to-r from-primary to-accent"
                      onClick={handleSend}
                    >
                      Gửi ngay
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 hover:border-primary hover:bg-primary/5">
                    <ArrowDownLeft className="h-5 w-5" />
                    <span className="text-xs font-semibold">Nhận</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ArrowDownLeft className="h-5 w-5 text-primary" />
                      Nhận tiền
                    </DialogTitle>
                    <DialogDescription>
                      Chia sẻ địa chỉ ví của bạn để nhận tiền
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg text-center space-y-4 border-2 border-primary/20">
                      <div className="flex items-center justify-center gap-2">
                        <WalletIcon className="h-5 w-5 text-primary" />
                        <p className="text-sm font-semibold">BiggetWallet</p>
                      </div>
                      <p className="text-sm break-all font-mono bg-background/80 p-3 rounded">{walletAddress}</p>
                      <Button 
                        className="gap-2 w-full bg-gradient-to-r from-primary to-accent"
                        onClick={handleCopyAddress}
                      >
                        <Copy className="h-4 w-4" />
                        Sao chép địa chỉ
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      ⚠️ Chỉ gửi tài sản tương thích với mạng {networkName} đến địa chỉ này
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 hover:border-primary hover:bg-primary/5">
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-xs font-semibold">Swap</span>
              </Button>

              <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 hover:border-primary hover:bg-primary/5">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-semibold">Mua</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tokens & Transactions Tabs */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="tokens" className="text-base font-semibold">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tài sản
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-base font-semibold">
              <History className="h-4 w-4 mr-2" />
              Lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Danh sách Token</CardTitle>
                <CardDescription>Quản lý tất cả tài sản crypto của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokens.map((token, index) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all cursor-pointer border border-border/50 hover:border-primary/30 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{token.icon}</div>
                      <div>
                        <p className="font-bold text-lg text-foreground">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">
                        {hideBalance ? "****" : token.balance.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-sm text-muted-foreground">
                          ${hideBalance ? "****" : (token.balance * token.price).toLocaleString()}
                        </p>
                        <Badge variant={token.change >= 0 ? "default" : "destructive"} className="text-xs">
                          {token.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {Math.abs(token.change)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-3 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch sử giao dịch</CardTitle>
                <CardDescription>Xem tất cả giao dịch của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all border border-border/50 hover:border-primary/30 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            tx.type === "send" 
                              ? "bg-red-500/20 text-red-500" 
                              : tx.type === "receive"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-blue-500/20 text-blue-500"
                          }`}>
                            {tx.type === "send" ? (
                              <ArrowUpRight className="h-6 w-6" />
                            ) : tx.type === "receive" ? (
                              <ArrowDownLeft className="h-6 w-6" />
                            ) : (
                              <ArrowLeftRight className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-base text-foreground">
                              {tx.type === "send" ? "Đã gửi" : tx.type === "receive" ? "Đã nhận" : "Đã swap"} {tx.token}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tx.type === "send" && `Đến ${tx.to}`}
                              {tx.type === "receive" && `Từ ${tx.from}`}
                              {tx.type === "swap" && `Từ ${tx.from}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                                {tx.status === "completed" ? "✓ Hoàn thành" : "⏳ Đang xử lý"}
                              </Badge>
                              <button 
                                onClick={() => toast.info(`Hash: ${tx.hash}`)}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === "send" ? "text-red-500" : tx.type === "receive" ? "text-green-500" : "text-blue-500"
                          }`}>
                            {tx.type === "send" ? "-" : tx.type === "receive" ? "+" : "~"}{tx.amount} {tx.token}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">Chưa có giao dịch nào</p>
                    <p className="text-sm">Giao dịch của bạn sẽ hiển thị ở đây</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Wallet;
