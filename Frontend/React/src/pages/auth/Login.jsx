import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
    console.log("BUTTON CLICKED");
 const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("Button Clicked");
  console.log("Form Data:", formData);

  setLoading(true);
  setError("");

  try {
    const data = await login(formData);

    console.log("Backend Response:", data);

    if (data.role === "admin") {
      navigate("/admin");
    } else if (data.role === "faculty") {
      navigate("/faculty");
    } else {
      navigate("/student");
    }
  } catch (err) {
    console.error("Login Error:", err);
    console.error("Response:", err.response);

    setError("Invalid username or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-[400px] shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            USMS
          </CardTitle>

          <p className="text-center text-gray-500">
            University Student Management System
          </p>
        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>
              <Label>Username</Label>

              <Input
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Password</Label>

              <Input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
                >
                {loading ? "Logging in..." : "Login"}
            </Button>

          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default Login;