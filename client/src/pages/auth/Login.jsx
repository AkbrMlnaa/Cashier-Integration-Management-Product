import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@/components/ui/errormessage";

export const Login = ({ auth, setAuth }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // LOGIC TIDAK BERUBAH SAMA SEKALI
  useEffect(() => {
    if (auth?.authenticated) {
      navigate("/dashboard");
    }
  }, [auth.authenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const res = await loginUser(formData.email, formData.password);

    setIsLoading(false);

    if (res.error) {
      setErrorMessage(res.message || "Login gagal");
      return;
    }

    if (!res.error) {
      setAuth({ authenticated: true, profile: res.profile });
      navigate("/dashboard");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-white to-red-50 overflow-hidden relative selection:bg-red-100 selection:text-red-900">
      {/* Background Blobs yang lebih halus */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-white/40 shadow-2xl bg-white/80 backdrop-blur-md rounded-2xl mx-4 sm:mx-auto ring-1 ring-white/60">
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl flex items-center justify-center shadow-red-200 shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
              <span className="text-white font-bold text-xl tracking-tighter">
                BS
              </span>
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm max-w-xs mx-auto">
            Aplikasi{" "}
            <span className="font-semibold text-rose-600">Bintang Sanga'</span>{" "}
            untuk mengelola bisnis dan layanan kasir.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <ErrorMessage message={errorMessage} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 ml-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="pl-12 pr-4 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 ml-1"
              >
                Password
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors duration-200">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  className="pl-12 pr-12 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-red-500/20 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all duration-300 transform active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer text aesthetic */}
      <div className="absolute bottom-6 left-0 w-full text-center text-xs text-gray-400">
        <p>&copy; 2024 Bintang Sanga'.</p>
        <p className="mt-1">Developed by Akbar Maulana Husada</p>
      </div>
    </div>
  );
};
