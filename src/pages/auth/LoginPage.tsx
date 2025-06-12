// src/pages/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/App";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setIsError(true);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-800">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-slate-800 rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Email"
                required
                className="w-full transition-all duration-150 bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              />
            </div>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                required
                className="w-full pr-10 transition-all duration-150 bg-gray-50 border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute px-3 inset-y-0 right-0 flex items-center bg-transparent hover:bg-transparent text-gray-500 hover:text-indigo-600 transition-all duration-150 ease-in-out transform hover:scale-110 active:scale-95"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || "Failed to login"}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-150 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
