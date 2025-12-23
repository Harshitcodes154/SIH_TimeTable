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
          The application requires a database and authentication configuration (Supabase or Firebase) to work properly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-2">To complete the setup:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>If using Supabase: create a project at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a> and add your URL/key to env vars.</li>
            <li>If using Firebase: create a project at <a href="https://console.firebase.google.com" className="underline" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a>, enable Auth and Firestore, and add Firebase config to env vars.</li>
            <li>Update your environment variables (example):
              <div className="mt-2 p-3 bg-yellow-100 rounded-md font-mono text-xs">
                NEXT_PUBLIC_SUPABASE_URL=your-project-url (optional)<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key (optional)<br/>
                NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key<br/>
                NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
              </div>
            </li>
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