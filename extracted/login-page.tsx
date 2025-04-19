import AuthForm from "@/polymet/components/auth-form";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <AuthForm type="login" />
      </div>
    </div>
  );
}
