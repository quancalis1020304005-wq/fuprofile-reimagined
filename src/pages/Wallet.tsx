import { useState } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Wallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance] = useState(0);

  const handleConnectWallet = () => {
    toast.success("Đã kết nối ví thành công!");
    setIsConnected(true);
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
            <p className="text-muted-foreground mb-6">Chưa kết nối ví</p>
            <Button
              onClick={handleConnectWallet}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <WalletIcon className="h-4 w-4" />
              Connect Wallet
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
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Số dư khả dụng</p>
                <p className="text-4xl font-bold text-foreground">
                  ${balance.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <ArrowUpRight className="h-4 w-4" />
                  Gửi
                </Button>
                <Button variant="outline" className="gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Nhận
                </Button>
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
