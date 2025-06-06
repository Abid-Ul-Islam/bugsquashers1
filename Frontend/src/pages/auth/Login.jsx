import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import Lottie from "react-lottie-player";
import welcomeback from "./assets/welcomeback";
import { toast } from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./Firebase";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const formMethods = useForm();

  const { handleSubmit } = formMethods;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("authToken", token);
      } else {
        localStorage.removeItem("authToken");
      }
    });

    return () => unsubscribe();
  }, []);

  async function onSubmit(data) {
    setIsLoading(true);
    const { email, password } = data;

    if (!email || !password) {
      toast.error("Please enter email and password");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        toast.success("Login successful!");
        
        switch (userRole) {
          case "Admin":
            navigate("/admin");
            break;
          case "User":
            navigate("/");
            break;
          case "Shopkeeper":
            navigate("/");
            break;
          case "Deliveryman":
            navigate("/deliverydash");
            break;
          case "Farmer":
            navigate("/farmerdash");
            break;
          default:
            navigate("/");
            break;
        }
      } else {
        toast.error("User role not found, please contact support.");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Column - Lottie Animation */}
      <div className="hidden lg:block w-1/2 bg-muted items-center justify-center pt-28">
        <Lottie loop animationData={welcomeback} play className="w-full h-[70%]" />
        <div className="text-3xl text-primary flex items-center justify-center font-praise">
          <h1>Welcome Back !!</h1>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <FormProvider {...formMethods}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Sign in to your account</h2>
              <p className="text-muted-foreground">Enter your email and password to continue</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <FormItem>
                  <FormLabel className="sr-only" htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...formMethods.register("email")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel className="sr-only" htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...formMethods.register("password")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                {/* Forgot Password Link */}
                <div className="text-right text-sm">
                  <Link 
                    to="/forgetpassword" 
                    className="font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </div>
            </form>

            {/* Removed social login section */}

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}