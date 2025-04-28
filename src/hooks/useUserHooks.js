import { useEffect, useState } from "react";
import { supabase } from "@/supaBaseClient"; // ajustá el path si es necesario

export const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRole = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user:", userError);
        setLoading(false);
        return;
      }

      const userId = user.id;
      console.log("User ID being used:", userId);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching role:", error);
        } else {
          setRole(data?.rol);
        }
      } catch (err) {
        console.error("Unexpected error fetching role:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { role, loading };
};
