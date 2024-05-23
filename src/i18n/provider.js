import { useMaterialUIController } from "context";
import React, { Fragment } from "react";
import { IntlProvider } from "react-intl";
import { LOCALES } from "./locales";
import Messages from "./messages";

const provider = ({ children }) => {
  const [controller] = useMaterialUIController();

  return (
    <IntlProvider
      locale={controller.language}
      textComponent={Fragment}
      messages={Messages[controller.language]}
      defaultLocale={LOCALES.ENGLISH}
    >
      {children}
    </IntlProvider>
  );
};

export default provider;
