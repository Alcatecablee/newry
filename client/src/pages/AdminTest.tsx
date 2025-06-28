import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function AdminTest() {
  const [testKey, setTestKey] = useState("TEST_SETTING");
  const [testValue, setTestValue] = useState("test_value");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Saving:", { [testKey]: testValue });

      const response = await fetch("/api/admin/save-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          envVars: { [testKey]: testValue },
        }),
      });

      const result = await response.json();
      console.log("Save result:", result);

      if (response.ok) {
        setLastSaved(new Date());
        toast({
          title: "✅ Environment variable saved!",
          description: `${testKey}=${testValue} written to .env file`,
        });
      } else {
        throw new Error(result.message || "Save failed");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "❌ Save failed",
        description: error.message || "Could not save environment variable",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickTest = async () => {
    const testConfig = {
      QUICK_TEST: `test_${Date.now()}`,
      API_TEST: "http://localhost:5000",
      FEATURE_FLAG: "enabled",
    };

    setSaving(true);
    try {
      const response = await fetch("/api/admin/save-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ envVars: testConfig }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastSaved(new Date());
        toast({
          title: "✅ Quick test successful!",
          description: "Multiple environment variables saved successfully",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "❌ Quick test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Admin Environment Variable Test
        </h1>

        {lastSaved && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            ✅ Last saved: {lastSaved.toLocaleString()}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Individual Test */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Individual Variable Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-key">Environment Variable Key</Label>
                <Input
                  id="test-key"
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  placeholder="TEST_SETTING"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="test-value">Environment Variable Value</Label>
                <Input
                  id="test-value"
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                  placeholder="test_value"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving || !testKey || !testValue}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Save Variable"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Test */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Quick Multiple Variables Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                This will save multiple test variables at once:
              </p>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• QUICK_TEST=test_[timestamp]</li>
                <li>• API_TEST=http://localhost:5000</li>
                <li>• FEATURE_FLAG=enabled</li>
              </ul>

              <Button
                onClick={handleQuickTest}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {saving ? "Saving..." : "Run Quick Test"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Status */}
        <Card className="bg-zinc-900 border-zinc-800 mt-6">
          <CardHeader>
            <CardTitle>API Status Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={async () => {
                try {
                  const response = await fetch("/api/health");
                  const data = await response.json();
                  toast({
                    title: "✅ API is working",
                    description: `Server status: ${data.status} at ${data.timestamp}`,
                  });
                } catch (error) {
                  toast({
                    title: "❌ API error",
                    description: "Could not reach the API server",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Test API Connection
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            How to Verify Saving Works:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-zinc-300">
            <li>
              Click "Run Quick Test" or enter custom values and click "Save
              Variable"
            </li>
            <li>Check the console logs for API responses</li>
            <li>Look for success toast notifications</li>
            <li>The variables are saved to the .env file on the server</li>
            <li>
              You can verify by checking the server logs or .env file directly
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
