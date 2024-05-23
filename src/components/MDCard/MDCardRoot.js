/**
=========================================================
* Material Dashboard 2 PRO React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import { Card } from "@mui/material"
import { styled } from "@mui/material/styles"

export const BoxShadow = {
  light:
    "light: 0rem 0.25rem 0.375rem -0.0625rem rgb(28 28 28 / 20%), 0rem 0.125rem 0.25rem -0.0625rem rgb(14 14 14 / 45%)",
  dark: "0rem 0.125rem 0.125rem 0rem rgba(0, 0, 0, 0.14), 0rem 0.1875rem 0.0625rem -0.125rem rgba(0, 0, 0, 0.2), 0rem 0.0625rem 0.3125rem 0rem rgba(0, 0, 0, 0.45)"
}

export default styled(Card)(({ ownerState }) => {
  const { darkMode, color, bgColor, borderRadius } = ownerState
  return {
    boxShadow: darkMode ? BoxShadow.dark : BoxShadow.light,
    color: `${color || "rgba(0, 0, 0, 0.87)"}`,
    borderRadius: `${borderRadius || "0.75rem"}`,
    background: `${
      bgColor
        ? `linear-gradient(195deg,${bgColor || "#131313"}, #282828)`
        : "linear-gradient(195deg, #131313, #282828)"
    }`
  }
})
