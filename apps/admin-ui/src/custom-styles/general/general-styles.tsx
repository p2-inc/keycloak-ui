import {
  AlertVariant,
  Brand,
  Form,
  FormGroup,
  PageSection,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  ValidatedOptions,
} from "@patternfly/react-core";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HelpItem } from "../../components/help-enabler/HelpItem";
import { KeycloakTextInput } from "../../components/keycloak-text-input/KeycloakTextInput";
import { SaveReset } from "../components/SaveReset";
import { useState, ReactElement, useEffect } from "react";
import { useAdminClient } from "../../context/auth/AdminClient";
import { useRealm } from "../../context/realm-context/RealmContext";
import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { get, isEqual } from "lodash-es";
import { useAlerts } from "../../components/alert/Alerts";

type GeneralStylesType = {
  logoUrl: string;
  faviconUrl: string;
};

const LogoContainer = ({
  title,
  children,
}: {
  title: string;
  children: ReactElement<any, any>;
}) => {
  return (
    <Panel variant="bordered" className="pf-u-mt-lg">
      <PanelHeader>{title}</PanelHeader>
      <PanelMain>
        <PanelMainBody>{children}</PanelMainBody>
      </PanelMain>
    </Panel>
  );
};

const InvalidImageError = () => (
  <div>Invalid image url. Please check the link above.</div>
);

const ImageInsturction = ({ name }: { name: string }) => (
  <div>Enter a custom URL for the {name} to preview the image.</div>
);

// TODO: Add Validation
// TODO: Add Image Value Populate
export const GeneralStyles = () => {
  const { t } = useTranslation("styles");
  const { realm } = useRealm();
  const { adminClient } = useAdminClient();
  const { addAlert, addError } = useAlerts();
  const {
    register,
    control,
    reset,
    getValues,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GeneralStylesType>({
    defaultValues: {
      logoUrl: "",
      faviconUrl: "",
    },
  });

  async function loadRealm() {
    const realmInfo = await adminClient.realms.findOne({ realm });
    setFullRealm(realmInfo);
    setValue("logoUrl", get(realmInfo?.attributes, "assets.logo.url", ""));
    setValue(
      "faviconUrl",
      get(realmInfo?.attributes, "assets.favicon.url", "")
    );
  }

  const [logoUrlError, setLogoUrlError] = useState(false);
  const [faviconUrlError, setFaviconUrlError] = useState(false);
  const [fullRealm, setFullRealm] = useState<RealmRepresentation>();

  useEffect(() => {
    loadRealm();
  }, []);

  const isValidUrl = (
    isValid: boolean,
    formElement: "logoUrl" | "faviconUrl",
    setUrlError: (errorState: boolean) => void
  ) => {
    if (isValid) {
      clearErrors(formElement);
      setUrlError(false);
    } else {
      setUrlError(true);
      setError(formElement, { type: "custom", message: "Invalid image URL." });
    }
  };

  useWatch({
    name: "logoUrl",
    control,
  });
  useWatch({
    name: "faviconUrl",
    control,
  });

  const save = async () => {
    // update realm with new attributes
    const updatedRealm = {
      ...fullRealm,
      attributes: {
        ...fullRealm!.attributes,
        "assets.logo.url": logoUrl,
        "assets.favicon.url": faviconUrl,
      },
    };

    try {
      await adminClient.realms.update({ realm }, updatedRealm);
      addAlert("Attributes for realm have been updated.", AlertVariant.success);
    } catch (e) {
      console.error("Could not update realm with attributes.", e);
      addError("Failed to update realm.", e);
    }
  };

  const logoUrl = getValues("logoUrl");
  const faviconUrl = getValues("faviconUrl");

  const LogoUrlBrand = (
    <LogoContainer title="Logo Preview">
      {logoUrl ? (
        logoUrlError ? (
          <InvalidImageError />
        ) : (
          <Brand
            src={logoUrl}
            alt="Custom Logo"
            widths={{ default: "200px" }}
          ></Brand>
        )
      ) : (
        <ImageInsturction name="Logo" />
      )}
    </LogoContainer>
  );

  const FaviconUrlBrand = (
    <LogoContainer title="Favicon Preview">
      {faviconUrl ? (
        faviconUrlError ? (
          <InvalidImageError />
        ) : (
          <Brand
            src={faviconUrl}
            alt="Favicon"
            widths={{ default: "200px" }}
          ></Brand>
        )
      ) : (
        <ImageInsturction name="Favicon" />
      )}
    </LogoContainer>
  );

  return (
    <PageSection variant="light" className="keycloak__form">
      <Form isHorizontal>
        {/* Logo Url */}
        <FormGroup
          labelIcon={
            <HelpItem
              helpText="styles:formHelpLogoUrl"
              fieldLabelId="logoUrl"
            />
          }
          label={t("logoUrl")}
          fieldId="kc-styles-logo-url"
          helperTextInvalid={t("styles:formHelpLogoUrlInvalid")}
          validated={
            errors.logoUrl ? ValidatedOptions.error : ValidatedOptions.default
          }
        >
          <KeycloakTextInput
            ref={register({ required: true })}
            type="text"
            id="kc-styles-logo-url"
            data-testid="kc-styles-logo-url"
            name="logoUrl"
            validated={
              errors.logoUrl ? ValidatedOptions.error : ValidatedOptions.default
            }
          />
          {LogoUrlBrand}
          {logoUrl && (
            <img
              className="pf-u-display-none"
              src={logoUrl}
              onError={() => isValidUrl(false, "logoUrl", setLogoUrlError)}
              onLoad={() => isValidUrl(true, "logoUrl", setLogoUrlError)}
            ></img>
          )}
        </FormGroup>

        {/* Favicon Url */}
        <FormGroup
          labelIcon={
            <HelpItem
              helpText="styles:formHelpFaviconUrl"
              fieldLabelId="faviconUrl"
            />
          }
          label={t("faviconUrl")}
          fieldId="kc-styles-favicon-url"
          helperTextInvalid={t("styles:formHelpFaviconUrlInvalid")}
          validated={
            errors.faviconUrl
              ? ValidatedOptions.error
              : ValidatedOptions.default
          }
        >
          <KeycloakTextInput
            ref={register({ required: true })}
            type="text"
            id="kc-styles-favicon-url"
            data-testid="kc-styles-favicon-url"
            name="faviconUrl"
            validated={
              errors.faviconUrl
                ? ValidatedOptions.error
                : ValidatedOptions.default
            }
          />
          {FaviconUrlBrand}
          {faviconUrl && (
            <img
              className="pf-u-display-none"
              src={faviconUrl}
              onError={() =>
                isValidUrl(false, "faviconUrl", setFaviconUrlError)
              }
              onLoad={() => isValidUrl(true, "faviconUrl", setFaviconUrlError)}
            ></img>
          )}
        </FormGroup>
        <SaveReset
          name="generalStyles"
          save={save}
          reset={reset}
          isActive={isDirty && isEqual(errors, {})}
        />
      </Form>
    </PageSection>
  );
};
