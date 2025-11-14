import logoVideo from "@/assets/logo-video.mp4";

export const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative mb-4">
        <video
          src={logoVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-32 h-32 rounded-2xl object-cover shadow-lg"
        />
      </div>
      <p className="text-sm text-muted-foreground mt-1 font-medium">Đăng nhập vào tài khoản của bạn</p>
    </div>
  );
};
