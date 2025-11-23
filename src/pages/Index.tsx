import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const Index = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/feed");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/feed");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email hoặc mật khẩu không đúng! Nếu chưa có tài khoản, vui lòng đăng ký.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Đăng nhập thành công!");
        navigate("/feed");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = signupSchema.safeParse({ 
      email: email.trim(), 
      password, 
      username: username.trim(), 
      fullName: fullName.trim() 
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim(),
          },
          emailRedirectTo: `${window.location.origin}/feed`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Email này đã được đăng ký. Hãy thử đăng nhập!");
          setIsLogin(true);
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Đăng ký thành công! Đang đăng nhập...");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        toast.error("Không thể gửi email. Vui lòng thử lại.");
        return;
      }

      toast.success("Đã gửi link đặt lại mật khẩu đến email của bạn!");
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <Logo />
            <form onSubmit={handleResetPassword} className="space-y-5 mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Quên mật khẩu?</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Nhập email để nhận link đặt lại mật khẩu
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="email@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowResetPassword(false)}
                className="w-full"
              >
                Quay lại đăng nhập
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <Logo />
          
          <div className="mt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isLogin 
                  ? "Chào mừng bạn quay trở lại!" 
                  : "Tạo tài khoản F.U Profile để bắt đầu"}
              </p>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên người dùng</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="username123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email F.U Profile</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-primary hover:text-accent"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setUsername("");
                  }}
                  className="text-sm text-primary hover:text-accent font-medium"
                >
                  {isLogin 
                    ? "Chưa có tài khoản? Đăng ký ngay" 
                    : "Đã có tài khoản? Đăng nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;