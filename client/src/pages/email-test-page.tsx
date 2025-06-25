import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function EmailTestPage() {
  const [email, setEmail] = useState("abdulramansagir@gmail.com");
  const [name, setName] = useState("Abdul Rahman");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testWelcomeEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email Sent Successfully!",
          description: `Welcome email sent to ${email}`,
        });
      } else {
        toast({
          title: "Email Failed",
          description: result.error || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testApplicationNotification = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentEmail: email,
          agentEmail: "agent@nextwave.ae",
          status: "under-review"
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Notification Sent!",
          description: `Application notification sent to ${email}`,
        });
      } else {
        toast({
          title: "Notification Failed",
          description: result.error || "Failed to send notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>SendGrid Email Testing</CardTitle>
          <CardDescription>
            Test the email notification system with your verified SendGrid configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter test email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name for personalization"
            />
          </div>

          <div className="space-y-4">
            <Button
              onClick={testWelcomeEmail}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Welcome Email"}
            </Button>

            <Button
              onClick={testApplicationNotification}
              disabled={loading || !email}
              variant="outline"
              className="w-full"
            >
              {loading ? "Sending..." : "Send Application Notification"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Welcome Email:</strong> Tests the registration confirmation email</p>
            <p><strong>Application Notification:</strong> Tests the application status change email</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}