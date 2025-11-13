import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <Logo />
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
