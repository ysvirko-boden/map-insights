# Firebase Auth Integration Guide
### .NET Minimal API + Vite React TypeScript

---

## 1. Firebase Console Setup
IGNORE THIS - DONE MANUALLY

---

## 2. Backend — .NET Minimal API

Firebase ID tokens are standard JWTs. Use ASP.NET's built-in `AddJwtBearer` — no custom middleware needed.

### 2.1 Install

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### 2.2 `Program.cs`

```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

var projectId = "YOUR_PROJECT_ID";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{projectId}";
        options.TokenValidationParameters = new()
        {
            ValidateIssuer   = true,
            ValidIssuer      = $"https://securetoken.google.com/{projectId}",
            ValidateAudience = true,
            ValidAudience    = projectId,
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(o =>
    o.AddDefaultPolicy(p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod()));

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Public
app.MapGet("/api/ping", () => Results.Ok("pong"));

// Protected
app.MapGet("/api/me", (HttpContext ctx) =>
{
    var uid   = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    var email = ctx.User.FindFirstValue("email");
    return Results.Ok(new { uid, email });
})
.RequireAuthorization();

app.Run();
```

> `AddJwtBearer` automatically fetches Google's public keys from the `Authority` URL and validates signature, issuer, audience, and expiry on every request. No service account key required.

---

## 3. Frontend — Vite + React + TypeScript

### 3.1 Install

```bash
npm install firebase
```

### 3.2 `src/lib/firebase.ts`

```ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
```

`.env.local` (never commit):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3.3 `src/context/AuthContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

### 3.4 `src/main.tsx` + `src/App.tsx`

```tsx
// main.tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider><App /></AuthProvider>
  </StrictMode>
);
```

```tsx
// App.tsx
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return user ? <Dashboard /> : <LoginPage />;
}
```

### 3.5 `src/pages/LoginPage.tsx`

```tsx
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword,
         signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);

  const wrap = (fn: () => Promise<unknown>) => () =>
    fn().catch((e: any) => setError(e.message));

  return (
    <div>
      <h1>Sign In</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button onClick={wrap(() => signInWithEmailAndPassword(auth, email, password))}>Sign in</button>
      <button onClick={wrap(() => createUserWithEmailAndPassword(auth, email, password))}>Register</button>
      <button onClick={wrap(() => signInWithPopup(auth, googleProvider))}>Sign in with Google</button>
    </div>
  );
}
```

### 3.6 `src/lib/api.ts`

```ts
import { auth } from "./firebase";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = await auth.currentUser?.getIdToken(); // auto-refreshes when expired

  return fetch(`http://localhost:5000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
}
```

### 3.7 Sign out

```ts
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

await signOut(auth);
```
