import AuthForm from "@/polymet/components/auth-form";

export default function SignupPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Enter your details to register as an agent
          </p>
        </div>
        <AuthForm type="signup" />
      </div>
    </div>
  );
}
