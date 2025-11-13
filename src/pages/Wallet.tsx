import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, Copy, ExternalLink } from "lucide-react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
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
        setBalance(1250.50); // You can fetch real balance here
        setIsConnected(true);
        toast.success("Đã kết nối ví BiggetWallet thành công!");
      }

      setConnector(walletConnector);

      // Setup event listeners
      walletConnector.on("connect", (error, payload) => {
        if (error) {
          console.error("Connection error:", error);
          toast.error("Lỗi kết nối ví!");
          return;
        }
        const { accounts, chainId: connectedChainId } = payload.params[0];
        setWalletAddress(accounts[0]);
        setChainId(connectedChainId);
        setBalance(1250.50); // You can fetch real balance here
        setIsConnected(true);
        toast.success("Đã kết nối ví BiggetWallet thành công!");
      });

      walletConnector.on("disconnect", (error) => {
        if (error) {
          console.error("Disconnect error:", error);
        }
        setIsConnected(false);
        setWalletAddress("");
        setBalance(0);
        toast.info("Đã ngắt kết nối ví!");
      });
    } catch (error) {
      console.error("WalletConnect error:", error);
      toast.error("Không thể kết nối ví!");
    }
  };

  useEffect(() => {
    return () => {
      if (connector && connector.connected) {
        connector.killSession();
      }
    };
  }, [connector]);

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
            <Button
              onClick={handleConnectWallet}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              Kết nối BiggetWallet
            </Button>
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
                <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
                <p className="text-4xl font-bold text-foreground">
                  ${balance.toLocaleString()}
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
