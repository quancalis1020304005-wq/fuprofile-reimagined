export const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-2">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg">
          <div className="text-white font-bold text-3xl">FU</div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md">
          <span className="text-white text-sm font-bold">P</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground">F.U.Profile</h1>
      <p className="text-sm text-primary mt-1">Đăng nhập vào tài khoản của bạn</p>
    </div>
  );
};
