import { PageSection, Tab, TabTitleText } from "@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { ViewHeader } from "../components/view-header/ViewHeader";
import helpUrls from "../help-urls";
import { useHistory } from "react-router-dom";
import {
  routableTab,
  RoutableTabs,
} from "../components/routable-tabs/RoutableTabs";
import { StylesParams, StylesTab, toStyles } from "./routes/Styles";
import { LoginStyles } from "./login/login-styles";
import { GeneralStyles } from "./general/general-styles";
import { EmailTemplate } from "./email/email-template";

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { KeycloakSpinner } from "../components/keycloak-spinner/KeycloakSpinner";
import { useAdminClient, useFetch } from "../context/auth/AdminClient";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function StylesSection() {
  const { t } = useTranslation("styles");
  const history = useHistory();

  const { adminClient } = useAdminClient();
  const { realm: realmName } = useParams<StylesParams>();
  const [realm, setRealm] = useState<RealmRepresentation>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [key, setKey] = useState(0);

  // const refresh = () => {
  //   setKey(key + 1);
  //   setRealm(undefined);
  // };

  useFetch(() => adminClient.realms.findOne({ realm: realmName }), setRealm, [
    key,
  ]);

  if (!realm) {
    return <KeycloakSpinner />;
  }

  const route = (tab: StylesTab) =>
    routableTab({
      to: toStyles({ realm: realmName, tab }),
      history,
    });

  return (
    <>
      <ViewHeader
        titleKey="styles:styles"
        subKey="styles:explain"
        helpUrl={helpUrls.stylesUrl}
        divider={false}
      />
      <PageSection variant="light" className="pf-u-p-0">
        <RoutableTabs
          mountOnEnter
          isBox
          defaultLocation={toStyles({
            realm: realmName,
            tab: "general",
          })}
        >
          <Tab
            data-testid="general"
            title={<TabTitleText>{t("general")}</TabTitleText>}
            {...route("general")}
          >
            <GeneralStyles />
          </Tab>
          <Tab
            data-testid="login"
            title={<TabTitleText>{t("login")}</TabTitleText>}
            {...route("login")}
          >
            <LoginStyles />
          </Tab>
          <Tab
            data-testid="email"
            title={<TabTitleText>{t("email")}</TabTitleText>}
            {...route("email")}
          >
            <EmailTemplate realm={realm} />
          </Tab>
        </RoutableTabs>
      </PageSection>
    </>
  );
}
