import { useState, useEffect } from "react";
import { GetRoleByName } from "@/services/authServices";
import { useAuth } from "@/context/AuthContext";

export const useRolePermissions = (title: string, component: string) => {
  const { auth } = useAuth();
  const schoolId = auth.roleId;

  const [permissions, setPermissions] = useState<String | string[] | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!schoolId || !title || !component) {
        setPermissions(null);
        return;
      }

      try {
        const response = await GetRoleByName(schoolId, title);
        const dbResponse = response.data.role[0];

        const filtered = dbResponse?.role_permissions?.filter(
          (e: any) => e.component === component
        );

        if (filtered.length > 0) {
          setPermissions(filtered[0].action);
        } else {
          setPermissions(null);
        }
      } catch (err) {
        setError("Error occurred while fetching permissions");
      }
    };

    fetchPermissions();
  }, [schoolId, title, component]);

  return { permissions, error };
};
