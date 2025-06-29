import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/ui/copy-button";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";

interface ProcessingResult {
  id: number;
  original: string;
  transformed: string;
  timestamp: string;
}

export default function LiveCodeSessions() {
  const [sessionCode, setSessionCode] = useState(`
    function MyComponent() {
      return (
        <div>
          <h1>Hello, world!</h1>
        </div>
      );
    }
  `);
  const [results, setResults] = useState<ProcessingResult[]>([]);

  useEffect(() => {
    const storedResults = localStorage.getItem('codeSessions');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('codeSessions', JSON.stringify(results));
  }, [results]);

  const processCode = async (sessionCode: string) => {
    try {
      const { transformed } = await NeuroLintOrchestrator.processCode(
        sessionCode,
        'session.tsx',
        true,
        [1, 2, 3, 4]
      );
      
      const newResult = {
        id: Date.now(),
        original: sessionCode,
        transformed,
        timestamp: new Date().toISOString(),
      };
      
      setResults((prev: any[]) => [newResult, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Live Code Sessions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Session Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="h-96"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              placeholder="Enter your session code here..."
            />
            <div className="flex justify-end mt-2">
              <Button onClick={() => processCode(sessionCode)}>
                Process Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Result</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <>
                <Textarea
                  className="h-96"
                  value={results[0].transformed}
                  readOnly
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Processed on: {results[0].timestamp}
                  </p>
                  <CopyButton text={results[0].transformed} />
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                Enter code and click "Process Code" to see the transformed
                output.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {results.slice(1).map((result) => (
            <div key={result.id} className="mb-4 p-4 border rounded-md">
              <h3 className="font-semibold">Session at {result.timestamp}</h3>
              <Textarea
                className="h-48"
                value={result.transformed}
                readOnly
              />
              <CopyButton text={result.transformed} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
