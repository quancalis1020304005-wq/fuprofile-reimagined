import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, Copy, ExternalLink, RefreshCw, TrendingUp, TrendingDown, History, Settings, Eye, EyeOff, ArrowLeftRight, DollarSign, BarChart3, Send, ArrowDownToLine, Sparkles, Wallet2 } from "lucide-react";
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
  const [hideBalance, setHideBalance] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"walletconnect" | "metamask" | null>(null);
  
  // Mock tokens data with auto-update
  const [tokens, setTokens] = useState([
    { symbol: "ETH", name: "Ethereum", balance: 2.5, price: 2340.50, change: 2.5, icon: "⟠", color: "from-chart-1 to-chart-4" },
    { symbol: "BTC", name: "Bitcoin", balance: 0.15, price: 43200.00, change: -1.2, icon: "₿", color: "from-warning to-chart-3" },
    { symbol: "USDT", name: "Tether", balance: 5000, price: 1.00, change: 0.0, icon: "₮", color: "from-success to-chart-2" },
    { symbol: "BNB", name: "BNB", balance: 8.3, price: 312.45, change: 3.8, icon: "◆", color: "from-chart-3 to-warning" },
  ]);
  
  // Auto-refresh prices every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prevTokens => 
        prevTokens.map(token => {
          const priceChange = (Math.random() - 0.5) * (token.price * 0.02);
          const newPrice = Math.max(0, token.price + priceChange);
          const changePercent = ((newPrice - token.price) / token.price) * 100;
          
          return {
            ...token,
            price: Number(newPrice.toFixed(2)),
            change: Number((token.change + changePercent).toFixed(2))
          };
        })
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

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

  const handleConnectMetaMask = async () => {
    try {
      // Check if MetaMask is installed
      const ethereum = (window as any).ethereum;
      
      if (typeof ethereum === "undefined") {
        toast.error("Vui lòng cài đặt MetaMask!");
        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      // Request account access
      const accounts = await ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      if (accounts.length === 0) {
        toast.error("Không tìm thấy tài khoản!");
        return;
      }

      const address = accounts[0];
      const chainIdHex = await ethereum.request({ 
        method: "eth_chainId" 
      });
      const chain = parseInt(chainIdHex, 16);

      setWalletAddress(address);
      setChainId(chain);
      setIsConnected(true);
      setConnectionMethod("metamask");
      await fetchBalance(address, chain);
      toast.success("Đã kết nối MetaMask thành công!");

      // Listen for account changes
      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setWalletAddress("");
          setBalance(0);
          setNetworkName("");
          setConnectionMethod(null);
          toast.info("Đã ngắt kết nối MetaMask!");
        } else {
          setWalletAddress(accounts[0]);
          fetchBalance(accounts[0], chainId);
          toast.info("Đã chuyển tài khoản!");
        }
      });

      // Listen for chain changes
      ethereum.on("chainChanged", (chainIdHex: string) => {
        const newChain = parseInt(chainIdHex, 16);
        setChainId(newChain);
        if (walletAddress) {
          fetchBalance(walletAddress, newChain);
        }
        toast.info("Đã chuyển mạng!");
      });

    } catch (error: any) {
      console.error("MetaMask connection error:", error);
      if (error.code === 4001) {
        toast.error("Bạn đã từ chối kết nối!");
      } else {
        toast.error("Không thể kết nối MetaMask!");
      }
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
        setConnectionMethod("walletconnect");
        await fetchBalance(accounts[0], connectedChainId);
        toast.success("Đã kết nối WalletConnect thành công!");
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
        setConnectionMethod("walletconnect");
        await fetchBalance(accounts[0], connectedChainId);
        toast.success("Đã kết nối WalletConnect thành công!");
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
        setConnectionMethod(null);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center p-8 shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-chart-1 via-chart-4 to-warning flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="mb-3 text-4xl font-bold bg-gradient-to-r from-chart-1 via-chart-4 to-warning bg-clip-text text-transparent">
              MetaMask Wallet
            </CardTitle>
            <p className="text-muted-foreground mb-8 text-lg">Kết nối ví tiền điện tử của bạn</p>
            <div className="space-y-4">
              <Button
                onClick={handleConnectMetaMask}
                className="w-full bg-gradient-to-r from-warning to-chart-2 hover:from-warning/90 hover:to-chart-2/90 gap-2 h-12 text-base font-semibold shadow-xl"
              >
                <Wallet2 className="h-5 w-5" />
                Kết nối MetaMask
              </Button>
              
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-chart-1 to-chart-4 hover:from-chart-1/90 hover:to-chart-4/90 gap-2 h-12 text-base font-semibold shadow-xl"
              >
                <WalletIcon className="h-5 w-5" />
                Kết nối WalletConnect
              </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Premium Header */}
        <Card className="shadow-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-chart-1/5 via-chart-4/5 to-warning/5 opacity-50"></div>
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-chart-1 via-chart-4 to-warning rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-chart-1 to-chart-4 bg-clip-text text-transparent">
                    {connectionMethod === "metamask" ? "MetaMask Wallet" : "WalletConnect"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border/50 font-mono">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-chart-1/20"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {networkName && (
                      <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                        {networkName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-chart-1/20 rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Portfolio Card */}
        <Card className="shadow-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-card via-success/5 to-card overflow-hidden relative animate-fade-in">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          <CardContent className="pt-6 relative">
            {/* Total Balance */}
            <div className="text-center space-y-3 mb-6">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium">Tổng tài sản ước tính</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-success/20"
                  onClick={() => setHideBalance(!hideBalance)}
                >
                  {hideBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-3">
                <p className="text-5xl font-bold bg-gradient-to-r from-success via-chart-2 to-success bg-clip-text text-transparent">
                  {hideBalance ? "••••••••" : `$${getTotalPortfolioValue().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshBalance}
                  disabled={isLoadingBalance}
                  className="h-12 w-12 hover:bg-chart-1/20"
                >
                  <RefreshCw className={`h-7 w-7 text-chart-1 ${isLoadingBalance ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-success/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <span className="text-success font-bold text-lg">+$1,234.56</span>
                    <span className="text-muted-foreground ml-2">(+5.24%)</span>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-muted-foreground font-medium">
                  24h Thay đổi
                </div>
              </div>
            </div>

            {/* Premium Quick Actions */}
            <div className="grid grid-cols-4 gap-3">
              <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogTrigger asChild>
                  <Button className="flex-col h-auto py-4 gap-2 bg-gradient-to-br from-chart-1 to-chart-4 hover:from-chart-1/90 hover:to-chart-4/90 shadow-lg">
                    <Send className="h-5 w-5" />
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
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 border-success/50 hover:border-success hover:bg-success/10 shadow-lg">
                    <ArrowDownToLine className="h-5 w-5" />
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
                        {connectionMethod === "metamask" ? (
                          <Wallet2 className="h-5 w-5 text-warning" />
                        ) : (
                          <WalletIcon className="h-5 w-5 text-primary" />
                        )}
                        <p className="text-sm font-semibold">
                          {connectionMethod === "metamask" ? "MetaMask" : "WalletConnect"}
                        </p>
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

              <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 border-chart-4/50 hover:border-chart-4 hover:bg-chart-4/10 shadow-lg">
                <ArrowLeftRight className="h-5 w-5" />
                <span className="text-xs font-semibold">Swap</span>
              </Button>

              <Button variant="outline" className="flex-col h-auto py-4 gap-2 border-2 border-warning/50 hover:border-warning hover:bg-warning/10 shadow-lg">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-semibold">Mua</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Tokens & Transactions Tabs */}
        <Card className="shadow-2xl border-2 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
                <TabsTrigger value="tokens" className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-chart-1 data-[state=active]:to-chart-4 data-[state=active]:text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Tài sản
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-chart-1 data-[state=active]:to-chart-4 data-[state=active]:text-white">
                  <History className="h-4 w-4 mr-2" />
                  Lịch sử
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tokens" className="space-y-3 mt-6">
                {tokens.map((token, index) => (
                  <div
                    key={token.symbol}
                    className="group relative flex items-center justify-between p-5 rounded-2xl hover:shadow-xl transition-all border-2 border-transparent hover:border-chart-1/30 bg-gradient-to-r from-card to-muted/30 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${token.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-14 h-14 bg-gradient-to-br ${token.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                        {token.icon}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <p className="font-bold text-lg">
                        {hideBalance ? "****" : `${token.balance} ${token.symbol}`}
                      </p>
                      <div className="flex items-center gap-2 justify-end">
                        <p className="text-sm font-semibold text-foreground">
                          ${hideBalance ? "****" : (token.balance * token.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${token.change >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                          {token.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{Math.abs(token.change).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3 mt-6">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((tx, index) => (
                      <div
                        key={tx.id}
                        className="group flex items-center justify-between p-5 rounded-2xl hover:shadow-xl transition-all border-2 border-transparent hover:border-chart-1/30 bg-gradient-to-r from-card to-muted/30 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                            tx.type === "send" 
                              ? "bg-gradient-to-br from-chart-1 to-chart-4" 
                              : tx.type === "receive"
                              ? "bg-gradient-to-br from-success to-chart-2"
                              : "bg-gradient-to-br from-chart-4 to-warning"
                          }`}>
                            {tx.type === "send" ? (
                              <Send className="h-6 w-6 text-white" />
                            ) : tx.type === "receive" ? (
                              <ArrowDownToLine className="h-6 w-6 text-white" />
                            ) : (
                              <ArrowLeftRight className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-base">
                              {tx.type === "send" ? "Đã gửi" : tx.type === "receive" ? "Đã nhận" : "Đã swap"} {tx.token}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                              {tx.type === "send" && `Đến ${tx.to}`}
                              {tx.type === "receive" && `Từ ${tx.from}`}
                              {tx.type === "swap" && `Từ ${tx.from}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge 
                                variant={tx.status === "completed" ? "default" : "secondary"} 
                                className={`text-xs ${tx.status === "completed" ? 'bg-success text-success-foreground' : ''}`}
                              >
                                {tx.status === "completed" ? "✓ Hoàn thành" : "⏳ Đang xử lý"}
                              </Badge>
                              <button 
                                onClick={() => toast.info(`Hash: ${tx.hash}`)}
                                className="text-xs text-chart-1 hover:underline flex items-center gap-1 font-mono"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {tx.hash.slice(0, 8)}...
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === "send" ? "text-foreground" : tx.type === "receive" ? "text-success" : "text-chart-4"
                          }`}>
                            {tx.type === "send" ? "-" : tx.type === "receive" ? "+" : "~"}{tx.amount} {tx.token}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có giao dịch nào</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
