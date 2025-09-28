"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function ConfigWarning() {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          ⚠️ Configuration Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          The application requires Supabase configuration to work properly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-2">To complete the setup:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a Supabase project at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
            <li>Copy your project URL and anon key</li>
            <li>Update your environment variables:
              <div className="mt-2 p-3 bg-yellow-100 rounded-md font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_URL=your-project-url<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
              </div>
            </li>
            <li>Run the database migrations in your Supabase project</li>
            <li>Restart the application</li>
          </ol>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Database: Not Connected
          </Badge>
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Status: Demo Mode
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}