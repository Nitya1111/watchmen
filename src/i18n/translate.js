import React from "react";
import { FormattedMessage } from "react-intl";

const translate = (values) =>
  values ? <FormattedMessage id={values} defaultMessage={values} /> : values;

export default translate;
