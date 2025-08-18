"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { AppDispatch, RootState } from "@/reducer/store";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Loader } from "rizzui";

const withAuth = (WrappedComponent: any) => {
  const AuthenticatedComponent = (props: any) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const router = useRouter();
    const dispatch: AppDispatch = useDispatch();
    const user = useSelector((state: any) => state.user?.user?.user);
    const accountType = useSelector(
      (state: any) => state.user?.user?.user?.account_type
    );

    useEffect(() => {
      const tokenString =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData: string | null =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const userInfo = userData ? JSON.parse(userData) : "";

      const getSubasctiptionData = async () => {
        userInfo.id && (await dispatch(fetchSubscription({ id: userInfo.id })));
      };

      const isToken = !!tokenString;
      if (!isToken) {
        localStorage.clear();
        sessionStorage.clear();
        Cookies.remove("lastApiCall");
        router.push("/login");
      } else {
        if (user) {
          if (
            !user?.research_interests &&
            !user?.research_goals &&
            !user?.research_roles
          ) {
            router.push("/main-topic-explorer");
          } else if (accountType === "owner") {
            getSubasctiptionData();
            if (user.is_user_plan_active === true) {
              getSubasctiptionData();
              router.push(
                window.location.search.length > 0
                  ? window.location.pathname + window.location.search
                  : window.location.pathname
              );
            } else {
              getSubasctiptionData();
            }
          } else {
            getSubasctiptionData();
            router.push("/dashboard");
          }
        } else {
          getSubasctiptionData();
        }
        setAuthenticated(isToken);
        setLoading(false);
      }
    }, []);

    if (isLoading) {
      return (
        <div className="w-screen h-screen flex items-center justify-center text-[#9b9d9f]">
          Loading
          <Loader
            variant="threeDot"
            size="lg"
            className="ms-1 pt-[10px]"
          />
        </div>
      );
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};

export default withAuth;
