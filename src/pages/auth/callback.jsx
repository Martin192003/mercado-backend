import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supaBaseClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const listener = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;
      
      // Verifica si la sesión está disponible
      if (!user) {
        console.error("No se ha podido obtener el usuario.");
        return;
      }


      // Realiza la inserción del perfil
      const { error: insertError } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: user.email,
          rol: "admin",
          created_at: new Date(),
        },
      ]);

      // Verifica si hay un error en la inserción
      if (insertError) {
        console.error("Error insertando en profiles:", insertError.message);
      } else {
        console.log("Perfil insertado correctamente.");
      }

      // Redirige a home después de insertar el perfil
      navigate("/home");
    });

    // Cleanup listener
    return () => {
      listener?.unsubscribe();
    };
  }, [navigate]);

  return <p className="text-center mt-20">Confirmando tu cuenta...</p>;
};

export default AuthCallback;
