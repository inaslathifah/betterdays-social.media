import {
  ReactNode,
  createContext,
  useMemo,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";

import axiosWithConfig, { setAxiosConfig } from "../apis/axios-with-config";
import { IProfile } from "../apis/user/type";
import { getProfile } from "../apis/user/api";

interface Props {
  children: ReactNode;
}

interface Context {
  token: string;
  user: IProfile | undefined;
  changeToken: (token?: string) => void;
  refreshUser: () => Promise<void>;
}

const initialValue: Context = {
  token: "",
  user: undefined,
  changeToken: () => {},
  refreshUser: async () => {},
};

const TokenContext = createContext<Context>(initialValue);

export const TokenProvider = ({ children }: Props) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("token") ?? "";
    // set sinkron: efek anak berjalan lebih dulu daripada efek provider
    setAxiosConfig(saved);
    return saved;
  });
  const [user, setUser] = useState<IProfile>();

  useEffect(() => {
    setAxiosConfig(token);
    token !== "" && fetchProfile();
  }, [token]);

  axiosWithConfig.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response.status === 401) {
        changeToken();
      }

      return Promise.reject(error);
    }
  );

  async function fetchProfile() {
    try {
      const result = await getProfile();

      setUser(result.data);
    } catch (error) {
      toast((error as Error).message);
    }
  }

  const changeToken = useCallback(
    (token?: string) => {
      const newToken = token ?? "";
      setAxiosConfig(newToken);
      setToken(newToken);

      if (newToken !== "") {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
        setUser(undefined);
      }
    },
    []
  );

  const tokenContextValue = useMemo(
    () => ({
      token,
      user,
      changeToken,
      refreshUser: fetchProfile,
    }),
    [token, user, changeToken]
  );

  return (
    <TokenContext.Provider value={tokenContextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToken() {
  const context = useContext(TokenContext);

  if (context === undefined) {
    throw new Error("ERROR, useToken must be used within TokenContext");
  }

  return context;
}
