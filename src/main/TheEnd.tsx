import React from "react";

import { css } from "@emotion/react";

import { LuCircleCheck, LuCircleX } from "react-icons/lu";

import { useAppSelector } from "../redux/store";
import { selectEndState } from "../redux/endSlice";
import { basicButtonStyle, navigationButtonStyle, titleStyleBold } from "../cssStyles";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { CallbackButton } from "./Finish";
import { ProtoButton } from "@opencast/appkit";

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 */
const TheEnd: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  // Init redux variables
  const endState = useAppSelector(selectEndState);

  const text = () => {
    if (endState === "discarded") {
      return (<div>{t("theEnd.discarded-text")}</div>);
    } else if (endState === "success") {
      return (
        <div css={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        })}>
          <div css={titleStyleBold(theme)}>{t("theEnd.info-title")}</div>
          <div css={css({ width: "50%" })}>{t("theEnd.info-text")}</div>
        </div>);
    }
  };

  const theEndStyle = css({
    width: "100%",
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  });

  const restartOrBackStyle = css({
    display: "flex",
    flexDirection: "row",
    gap: "20px",
  });

  return (
    <div css={theEndStyle}>
      <div/>
      <div/>
      {endState === "discarded" ? <LuCircleX css={{ fontSize: 80 }} /> : <LuCircleCheck css={{ fontSize: 80 }} />}
      {text()}
      <div css={restartOrBackStyle}>
        <CallbackButton />
        {(endState === "discarded") && <StartOverButton />}
      </div>
    </div>
  );
};


const StartOverButton: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <ThemedTooltip title={t("theEnd.startOver-tooltip")}>
      <ProtoButton
        onClick={reloadPage}
        css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
      >
        <span>{t("theEnd.startOver-button")}</span>
      </ProtoButton>
    </ThemedTooltip>
  );
};

export default TheEnd;
