import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon, GithubIcon } from "@hugeicons/core-free-icons";
import signIn from "@/assets/signIn.svg";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
    navigate("/explore");
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    console.log(`Sign in with ${provider}`);
    // Add OAuth authentication logic here
  };

  return (
    <div className="w-full max-w-6xl min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 px-4">
      <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full p-8 rounded-xl shadow-xl bg-white bg-opacity-90">
        {/* Left: Image */}
        <div className="hidden md:flex w-1/2 justify-center">
          <img src={signIn} alt="Sign In" className="w-full max-w-sm" />
        </div>

        {/* Right: Sign In Form */}
        <Card className="w-full md:w-1/2 max-w-md p-8 rounded-xl border border-gray-300">
          <h2 className="exo-2-font text-xl font-semibold text-gray-800 text-center mb-6">
            Sign In to MetaLens
          </h2>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 titillium-web-regular"
          >
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
                className="pl-10 border border-gray-300 rounded-md focus:border-gray-500"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message && String(errors.email.message)}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
                className="pl-10 border border-gray-300 rounded-md focus:border-gray-500"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message && String(errors.password.message)}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
          </form>

          {/* Divider with lines */}
          <div className="flex items-center my-4 titillium-web-light">
            <hr className="flex-grow border-gray-300" />
            <p className="px-4 text-sm text-gray-500">or sign in with</p>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* OAuth Sign In */}
          <div className="flex flex-col gap-4 titillium-web-regular">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full"
              onClick={() => handleOAuthSignIn("google")}
            >
              <HugeiconsIcon icon={GoogleIcon} />
              Sign In with Google
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full"
              onClick={() => handleOAuthSignIn("github")}
            >
              <HugeiconsIcon icon={GithubIcon} />
              Sign In with GitHub
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-500 mt-6 titillium-web-regular">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
