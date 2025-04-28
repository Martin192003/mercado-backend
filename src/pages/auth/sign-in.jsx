import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "/src/supaBaseClient";
import { useUserRole } from "@/hooks/useUserHooks";
import { useEffect } from "react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("signIn response:", { data, error });

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    
    // Usar el id del usuario para obtener el rol de la base de datos
    const { user } = data;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();  // Solo esperamos un solo resultado

    if (profileError) {
      setErrorMessage("Error al obtener el rol del usuario.");
      return;
    }

    if (profile?.rol === "admin") {
      navigate("/dashboard/home");
    } else {
      navigate("/dashboard/HomeEmpleados");
    }

    if (!data?.session || !data?.user) {
      setErrorMessage("No se pudo iniciar sesión. ¿Confirmaste tu correo?");
      return;
    }
  };


  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Iniciar Sesión
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
            Ingresa tu email para Iniciar Sesión.
          </Typography>
        </div>
        <form onSubmit={handleSignIn} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Tu email
            </Typography>
            <Input
              size="lg"
              type="email"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              required
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Contraseña
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              required
            />
          </div>
          {errorMessage && (
            <Typography variant="small" color="red" className="mt-4 text-center">
              {errorMessage}
            </Typography>
          )}
          <Button type="submit" className="mt-6" fullWidth>
            Iniciar Sesión
          </Button>
        </form>
      </div>
      <div className="w-2/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl"
          alt="Background"
        />
      </div>
    </section>
  );
}

export default SignIn;
