import { lazy } from "react";
import { generatePath } from "react-router-dom";
import type { RouteDef } from "../../route-config";
import type { Path } from "react-router-dom";

export type StylesTab = "general" | "login" | "email" | "portal";

export type StylesParams = {
  realm: string;
  tab?: StylesTab;
};

export const StylesRoute: RouteDef = {
  path: "/:realm/styles",
  component: lazy(() => import("../StylesSection")),
  breadcrumb: (t) => t("styles"),
  access: "query-clients",
};

export const StylesRouteWithTab: RouteDef = {
  ...StylesRoute,
  path: "/:realm/styles/:tab",
};

export const toStyles = (params: StylesParams): Partial<Path> => {
  const path = params.tab ? StylesRouteWithTab.path : StylesRoute.path;

  return {
    pathname: generatePath(path, params),
  };
};
